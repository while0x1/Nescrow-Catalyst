from blockfrost import ApiUrls
from pycardano import ChainContext, BlockFrostChainContext,UTxO, Redeemer, RedeemerTag, MultiAsset, Value, datum_hash, TransactionOutput, TransactionInput, TransactionBuilder, PlutusV2Script, plutus_script_hash, VerificationKeyHash, VerificationKeyWitness, PaymentVerificationKey, Network, Address, TransactionBody, Transaction, TransactionWitnessSet
from static_var import *
from v3_nescrow_dex import Listing
from v3_nescrow_dex import Buy
import json
import requests
from multi_address import multi_address_unlock
from min_lovelace import min_lovelace_post_alonzo

def buildAcceptTx(offerUtxo,chain_context,unlock_address,utxoList,assetUtxos,usedAddresses,collateralHex,logger):
    
    try:

        script_address = Address.from_primitive(SCRIPT_ADDRESS)
        #print(script_address)
        datum = Listing(bytes.fromhex(offerUtxo['unlock_policy']),
            bytes.fromhex(offerUtxo['unlock_name']),
            int(offerUtxo['unlock_amount']),
            bytes.fromhex(offerUtxo['owner']),
            bytes.fromhex(offerUtxo['stake_cred']),
            FEE,
            CANCEL_FEE,
            bytes.fromhex(FEEHASH),
            bytes.fromhex(offerUtxo['rnd']))
        #print(datum)
        builder = TransactionBuilder(chain_context)
        script_utxos = chain_context.utxos(str(script_address))
        for utxo in script_utxos:
            if utxo.output.datum is not None:
                if utxo.output.datum.cbor.hex() == datum.to_cbor() and utxo.input.transaction_id.payload.hex() == offerUtxo['tx_hash'] and utxo.input.index == offerUtxo['tx_id'] :
                    #print('___ Target -- Acquired ___')
                    utxo_to_spend = utxo

        r = requests.get(BASE_URL + 'txs/' + offerUtxo['tx_hash'] + '/utxos', headers= BF_HEADERS)
        jres = json.loads(r.content)
        for n in jres['inputs']:
            test_address = Address.from_primitive(n['address'])
            if test_address.payment_part.payload.hex() == offerUtxo['owner']:
                seller_address = Address.from_primitive(n['address'])
                print('Owner Acquired:',str(seller_address))
                break

        #Pycardano v0.8.0 dont need redeemer TAG !!!!!+++++++++++++++++
        redeemer = Redeemer(Buy())
    
        ref_script_utxo = UTxO.from_cbor(REF_CBOR)
        builder.add_script_input(utxo_to_spend, script=ref_script_utxo, redeemer=redeemer)
        #print(builder)
        #Todo Add RawIn for Address
        taker_address = Address.from_primitive(unlock_address)
        #print(taker_address)
        if len(usedAddresses) > 1:
            #MultiAddressWallet
            print('MultiAddress Wallet Detected!')
            if collateralHex != '':
                collateral_tx_hash = str(collateralHex[8:72])
                collateral_tx_id = int(collateralHex[72:74])
                collateral_raw_address = str(collateralHex[80:194])
                collateral_address = Address.from_primitive(bytes.fromhex(collateral_raw_address))
                #builder.add_input_address(collateral_address)
                for utxo in chain_context.utxos(str(collateral_address)):
                    if utxo.output.amount.coin > 4000000:
                        col_utxo = utxo
                        builder.collaterals.append(col_utxo)
                        print(f' Collateral Input Found and added: {collateral_address} ----------')
                        break
                        #you could check collateral_return error and add another input here...
                #print(builder.collaterals)
            include_addresses = multi_address_unlock(assetUtxos,utxoList,offerUtxo['unlock_policy'],offerUtxo['unlock_name'],offerUtxo['unlock_amount'])
            include_addresses.append(unlock_address)
            include_addresses = list(set(include_addresses))
            for a in include_addresses: 
                builder.add_input_address(Address.from_primitive(a))
                #print(f'Multi Address added: {a}')
        else:
            #Single Address Wallet
            builder.add_input_address(taker_address)

        if len(utxo_to_spend.output.amount.multi_asset) > 0:
            take_output = TransactionOutput(taker_address,  Value(utxo_to_spend.output.amount.coin, utxo_to_spend.output.amount.multi_asset))
        else:
            take_output = TransactionOutput(taker_address,  utxo_to_spend.output.amount.coin)
        builder.add_output(take_output)
        if offerUtxo['unlock_name'] != '':
            swap_asset = MultiAsset.from_primitive({bytes.fromhex(offerUtxo['unlock_policy']): {bytes.fromhex(offerUtxo['unlock_name']): int(offerUtxo['unlock_amount'])}})
            min_lovelace = min_lovelace_post_alonzo(TransactionOutput(seller_address, Value(1000000, swap_asset), datum=datum.rnd),chain_context)
            builder.add_output(TransactionOutput(seller_address, Value(min_lovelace, swap_asset),datum=datum.rnd))
             
        else:
            builder.add_output(TransactionOutput(seller_address, int(offerUtxo['unlock_amount']),datum=datum.rnd))


        #MaynotNeedtoadd builder.required_signers for Buy but definitely will for Cancel Listing
        builder.add_output(TransactionOutput(Address.from_primitive(FEE_ADDRESS), FEE))

        #print(builder)
        #builder.required_signers = [taker_address.payment_part]
        unsignedTx = builder.build_and_sign([], change_address=taker_address)
        cbor_hex = unsignedTx.to_cbor()
        return cbor_hex
    except Exception as e:
        #print('BuilderError')
        logger.warning('!!! -------- Unlock Builder Error ----------- !!!')
        logger.error(e)
        #print(e)