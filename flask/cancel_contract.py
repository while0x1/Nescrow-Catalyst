from blockfrost import ApiUrls
from pycardano import BlockFrostChainContext,UTxO, Redeemer, RedeemerTag, MultiAsset, Value, datum_hash, TransactionOutput, TransactionInput, TransactionBuilder, PlutusV2Script, plutus_script_hash, VerificationKeyHash, VerificationKeyWitness, PaymentVerificationKey, Network, Address, TransactionBody, Transaction, TransactionWitnessSet
from static_var import *
from v3_nescrow_dex import Listing
from v3_nescrow_dex import Unlist
import json
import requests
from multi_address import multi_address_cancel

def buildCancelTx(offerUtxo,chain_context,unlock_address,utxoList,assetUtxos,usedAddresses,logger):
    #print('Used Addresses: ',usedAddresses)
    try:
        #with open("script.cbor", "r") as f:
        #    script_hex = f.read()
        #nescrow_script = PlutusV2Script(bytes.fromhex(script_hex))

        #script_hash = plutus_script_hash(nescrow_script)
        #print(script_hash)
        script_address = Address.from_primitive(SCRIPT_ADDRESS)
        #print(script_address)
        ##need to lookup the datum from contract using BF
        datum = Listing(bytes.fromhex(offerUtxo['unlock_policy']),
            bytes.fromhex(offerUtxo['unlock_name']),
            int(offerUtxo['unlock_amount']),
            bytes.fromhex(offerUtxo['owner']),
            bytes.fromhex(offerUtxo['stake_cred']),
            FEE,
            CANCEL_FEE,
            bytes.fromhex(FEEHASH),
            bytes.fromhex(offerUtxo['rnd']))
        print(datum)

        builder = TransactionBuilder(chain_context)
        #builder.add_input_address(script_address)

        script_utxos = chain_context.utxos(str(script_address))

        for utxo in script_utxos:
            if utxo.output.datum is not None:
                if utxo.output.datum.cbor.hex() == datum.to_cbor() and utxo.input.transaction_id.payload.hex() == offerUtxo['tx_hash'] and utxo.input.index == offerUtxo['tx_id'] :
                    print('___ Target -- Acquired ___')
                    utxo_to_spend = utxo
                    print(f'UTXO toSPEND {utxo_to_spend}')

        redeemer = Redeemer(Unlist())

        ref_script_utxo = UTxO.from_cbor(REF_CBOR)

        builder.add_script_input(utxo_to_spend, script=ref_script_utxo, redeemer=redeemer)
        #Todo Add RawIn for Address
        taker_address = Address.from_primitive(unlock_address)
        builder.add_input_address(taker_address)
        
        if len(usedAddresses) > 1:
            #MultiAddressWallet
            print('MultiAddress Wallet Detected!')
            include_addresses = multi_address_cancel(assetUtxos,utxoList)
            include_addresses = list(set(include_addresses))
            for a in include_addresses:
                builder.add_input_address(Address.from_primitive(a))
                print(f'Multi Address added: {a}')
 
        if len(utxo_to_spend.output.amount.multi_asset) > 0:
            take_output = TransactionOutput(taker_address,  Value(utxo_to_spend.output.amount.coin, utxo_to_spend.output.amount.multi_asset),datum=datum.rnd)
        else:
            take_output = TransactionOutput(taker_address,  utxo_to_spend.output.amount.coin,datum=datum.rnd)
        builder.add_output(take_output)
        #PayContractOwnerFees
        builder.add_output(TransactionOutput(Address.from_primitive(FEE_ADDRESS), CANCEL_FEE))
        builder.required_signers = [taker_address.payment_part]
        #print(builder)
        unsignedTx = builder.build_and_sign([], change_address=taker_address)
        cbor_hex = unsignedTx.to_cbor()
        return cbor_hex
    except Exception as e:
        #print('BuilderError')
        logger.warning('!!! ------ Cancel TX Build Failure ------ !!!')
        logger.error(e)
        print(e)