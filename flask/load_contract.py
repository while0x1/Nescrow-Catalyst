from blockfrost import ApiUrls
from pycardano import ChainContext, BlockFrostChainContext, MultiAsset, Value, datum_hash, TransactionOutput, TransactionInput, TransactionBuilder, PlutusV2Script, plutus_script_hash, VerificationKeyHash, VerificationKeyWitness, PaymentVerificationKey, Network, Address, TransactionBody, Transaction, TransactionWitnessSet
from static_var import *
from v3_nescrow_dex import Listing
from multi_address import multi_address
from min_lovelace import min_lovelace_post_alonzo
import secrets
from token_registry import *


'''
ListingClass:
unlock policy: fe0f0b4a48d8941565a921e50a08d9b0eff9294d603248e1e773208b
unlock name: 56657269466169725f56325f7469636b6574
amount:
owner pkh: f5b84180b5a3cca20052258fe73328c69ff8e0d41709505668101db7
stake_cred: 
fee: 5000000
cancelfee: 2000000
feehash: f5b84180b5a3cca20052258fe73328c69ff8e0d41709505668101db7
# unique order
rnd: bytes
'''
# Copy your BlockFrost project ID below. Go to https://blockfrost.io/ for more information.
                                                   
def buildTx(bidAmountReq,bidPolicy,bidNameHex,FEE,CANCEL_FEE,feehash,offerAda,nftList,pk,change,chain_context,sk,offerAssetAmount,usedAddresses,assetUtxos,inUtxos,offerLovelace,offeredAsset,logger):
    try:
        #with open("script.cbor", "r") as f:
        #    script_hex = f.read()
        #nescrow_script = PlutusV2Script(bytes.fromhex(script_hex))
        #script_hash = plutus_script_hash(nescrow_script)
        #script_address = Address(script_hash, network=NETWORK)
        script_address = Address.from_primitive(SCRIPT_ADDRESS)
        
        bid_decimals = getDecimals(bidPolicy,bidNameHex)
        bidAmountReq = bidAmountReq * 10 ** bid_decimals
        datum = Listing(bytes.fromhex(bidPolicy),
            bytes.fromhex(bidNameHex),
            bidAmountReq,
            bytes.fromhex(pk),
            bytes.fromhex(sk),
            FEE,
            CANCEL_FEE,
            bytes.fromhex(FEEHASH),
            bytes.fromhex(secrets.token_hex(28)))
            
        #pkh = VerificationKeyHash(bytes.fromhex('f5b84180b5a3cca20052258fe73328c69ff8e0d41709505668101db7'))
        builder = TransactionBuilder(chain_context)
        
        if len(usedAddresses) > 1:
            #MultiAddressWallet
            #print('MultiAddress Wallet Detected!')
            lovelace_required = 2000000 + 1800000 + 1500000 
            include_addresses = multi_address(assetUtxos,inUtxos,offerLovelace,offeredAsset,lovelace_required)
            #print('YOU ARE HERE ========================')
            include_addresses = list(set(include_addresses))
            
            #print(include_addresses)
            #for n in include_addresses:
                #print(n)
            for a in include_addresses:
                builder.add_input_address(Address.from_primitive(a))
                #print(f'Multi Address added: {a}')
        else:
            #Single Address Wallet
            print('Single Address WAllet Detected --Nami for the win! =================')
            print(change.encode())
            builder.add_input_address(change)
        
        if len(offerAda) > 0:
            offerLovelace = int(offerAda)*1000000
            
            #"AdaOffered"
            #builder.add_output(TransactionOutput(script_address, offerLovelace, datum_hash=datum_hash(datum)))
            builder.add_output(TransactionOutput(script_address, offerLovelace, datum=datum))
        else:
            offer_decimals = getDecimals(nftList['policy'],nftList['assethex'])
            offerAssetAmount = offerAssetAmount * 10 ** offer_decimals
            swap_asset = MultiAsset.from_primitive({bytes.fromhex(nftList['policy']): {bytes.fromhex(nftList['assethex']): offerAssetAmount}})
            #builder.add_output(TransactionOutput(script_address, Value(1500000, swap_asset), datum_hash=datum_hash(datum)))
            min_lovelace = min_lovelace_post_alonzo(TransactionOutput(script_address, Value(1000000, swap_asset), datum=datum),chain_context)
            builder.add_output(TransactionOutput(script_address, Value(min_lovelace, swap_asset), datum=datum))
            #print(f'MinLovelace Calculated as {min_lovelace}')
            #print(min_lovelace)
  
        fee_address = Address.from_primitive(FEE_ADDRESS)
        builder.add_output(TransactionOutput(fee_address, FEE))
        #pvk = PaymentVerificationKey(change.payment_part.to_primitive())
        #builder.required_signers = [pvk.hash()]
        #builder._estimate_fee = lambda : 300000

        tx_body = builder.build(change_address=change)
        unsignedTx = Transaction(tx_body, TransactionWitnessSet())
        #print(tx_body)
        cbor_hex = unsignedTx.to_cbor()
    except Exception as e:
        #print(e)
        logger.warning('!!! ------------- Load Contract TX builder Error ----------- !!!')
        logger.error(e)
        cbor_hex = 'BuildError'

    return cbor_hex

