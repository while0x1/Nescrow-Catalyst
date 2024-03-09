from flask import Flask, jsonify, request, json
from blockfrost import ApiUrls
from flask_cors import CORS
import time
import requests
from subprocess import PIPE, run
from pycardano import VerificationKeyHash, OgmiosChainContext, VerificationKeyWitness, PaymentVerificationKey, Network, Address, TransactionBody, Transaction, TransactionWitnessSet
from datetime import datetime,timedelta
import logging
from logging.handlers import RotatingFileHandler
import os

from bech_32_from_raw import *
from static_var import *
from load_contract import *
from get_script_utxos import *
from unlock_contract import *
from cancel_contract import *
from token_registry import *

app = Flask(__name__)
CORS(app)

NET = Network.MAINNET
chain_context = OgmiosChainContext("ws://127.0.0.1:1337", network=NET)
print('Starting Nescrow...')
print(chain_context)
##STATIC VAR
MAINNET = False
#getDirectories
cwd = os.getcwd()
#print(cwd)
logdir = "/logs"
#CreateLogFiles

if not os.path.exists(cwd+logdir):
    os.makedirs(cwd+logdir)   
pathtologfile = cwd+logdir+ '/flask_log'

logger = logging.getLogger('flask_log')
handler = RotatingFileHandler(pathtologfile, maxBytes=400000, backupCount=4)
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s',datefmt= '%d-%b-%y %H:%M:%S')
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.setLevel(logging.INFO)

logger.info("Nescrow started...")

@app.route('/flaskOffer', methods=['POST'])
def flaskOffer():
    reqAuth = request.headers.get("Auth")
    if reqAuth == FLASKAUTH:
        reqIn = request.get_json()
        netid = reqIn['NetworkId']
        rawAddressIn = reqIn['rawaddress']
        #print(f'Raw Address In: {rawAddressIn}')
        usedAddresses = reqIn['usedAddresses']
        #print(f'USED addresses: {usedAddresses}')
        nList = reqIn['nList']
        assetUtxos = reqIn['assetUtxos']['assets']
        #print(f'Complete list of asset utxos {assetUtxos}')
        #print(nList)
        pk = rawAddressIn[2:58]
        if len(rawAddressIn) > 59:
            sk = rawAddressIn[58:]
        else:
            sk = ''
        #print(sk)
        inUtxos = reqIn['utxoList']['utxo']
        #print(f'ADA only utxo List {inUtxos}')
        nftList = reqIn['nftList']
        #print(f'Offered asset {nftList}')
        offerAda = reqIn['offervalue']
        #print(f'Offering Ada: {offerAda}')
        bidAmountReq = int(reqIn['bidAmountReq'])
        bidPolicy = reqIn['bidPolicy']
        bidNameHex = reqIn['bidName']

        if bidPolicy == '':
            bidAmountReq = bidAmountReq * 1000000
        offerAssetAmount = int(reqIn['offerAssetAmount'])
        offerLovelace = 0
        if len(offerAda) > 0:
            offerLovelace = int(offerAda)*1000000

        address = bech32_from_raw(rawAddressIn, netid)
        change_address = Address.from_primitive(bytes.fromhex(rawAddressIn))
        #print('ChangeADDRESS:',change_address)
        logger.info(f'Escrow initiated: sellerAddress({address}), offerAda({offerAda}), Requested policy: ({bidPolicy}),requested Assetname:({bytes.fromhex(bidNameHex)}), BidAmountRequested: ({bidAmountReq}), sellerNft({nftList}),AssetQuantity:({offerAssetAmount})')
        #print(f'Escrow initiated: sellerAddress({address}), offerAda({offerAda}), Requested policy: ({bidPolicy}),BidAmountRequested: ({bidAmountReq}) ,requested Assetname:({bytes.fromhex(bidNameHex)}), sellerNft({nftList}),AssetQuantity:({offerAssetAmount})')

        unsigned_cbor = buildTx(bidAmountReq,bidPolicy,bidNameHex,FEE,CANCEL_FEE,FEEHASH,offerAda,nftList,pk,change_address,chain_context,sk,offerAssetAmount,usedAddresses,assetUtxos,inUtxos,offerLovelace,nftList,logger)
        response = jsonify({"Cbor_to_sign": unsigned_cbor })
        return response
    else:
        return 'Error', 403 

@app.route('/flaskWitnessed', methods=['POST'])
def flaskWitnessed():
    reqAuth = request.headers.get("Auth")
    if reqAuth == FLASKAUTH:
        try:
            reqIn = request.get_json()
            witnessed_cbor = reqIn['witness']
            tx_raw_cbor = reqIn['tx_body_cbor']
            witness = TransactionWitnessSet.from_cbor(witnessed_cbor)
            tx = Transaction.from_cbor(tx_raw_cbor)
            #tx.transaction_witness_set = witness
            tx.transaction_witness_set.vkey_witnesses = witness.vkey_witnesses
            tx_id = tx.transaction_body.hash().hex()
            #print('RAW_unwitnessed',tx_raw_cbor)
            #print('Witness CBOR',witnessed_cbor)
            chain_context.submit_tx(tx.to_cbor())
            logger.info(f'Tx Submission Success! {tx_id}')
            #print(tx_id)
            response = jsonify({"txId": tx_id })
        except Exception as e:
            #print('YouAreHere')
            response = jsonify({"txId": 'Error' })
            #print(e)
            logger.error(e)
        return response
    else:
        return 'Error', 403

@app.route('/flaskFindOffers', methods=['POST'])
def flaskFindOffers():
    reqAuth = request.headers.get("Auth")
    if reqAuth == FLASKAUTH:
        try:
            reqIn = request.get_json()
            netid = reqIn['NetworkId']
            rawAddressIn = reqIn['rawaddress']
            pk = rawAddressIn[2:58]
            #print('OWNER:',pk)
            inUtxos = reqIn['utxoList']['utxo']
            nftList = reqIn['nftList']
            find_escrow = reqIn['escrow']

            script_utxos = get_script_utxos()

            print(find_escrow)
            print(script_utxos)
            found_offers = []

            if find_escrow:
                for n in script_utxos:
                    
                    if n['owner'] == pk:
                            found_offers.append(n)
            else:
                #print('SCRIPT_UTXOS',script_utxos)
                #print('NFT_LIST----',nftList)
                for n in script_utxos:
                    found_offers.append(n)
                ##if len(nftList) > 0:
                   ## for n in script_utxos:
                       ## for i in nftList:
                            #if n['unlock_policy'] == i['policy'] and n['unlock_name'] == i['assethex']:
                        ##    if True:
                        ##        found_offers.append(n)
                        ##        break
            response = jsonify({"script_utxos": found_offers })
            print(f'FOUND OFFERS {found_offers} ')
        except Exception as e:
            response = jsonify({"script_utxos": 'Error' })
            print(e)
            logger.error(e)
        return response
    else:
        return 'Error',403

@app.route('/flaskAcceptOffer', methods=['POST'])
def flaskAcceptOffer():
    reqAuth = request.headers.get("Auth")
    if reqAuth == FLASKAUTH:
        try:
            reqIn = request.get_json()
            netid = reqIn['NetworkId']
            rawAddressIn = reqIn['rawaddress']
            pk = rawAddressIn[2:58]
            utxoList = reqIn['utxoList']['utxo']
            offerUtxo = reqIn['offerUtxo']
            usedAddresses = reqIn['usedAddresses']
            #print(f'Number of Used Addresses {len(usedAddresses)}')
            collateralHex = reqIn['collateralHex']
            #print(usedAddresses)
            #nftList = reqIn['nftList']
            assetUtxos = reqIn['assetUtxos']['assets']
            #print(offer_utxo)
            logger.info(f'Offer Accept process started for offer: {offerUtxo}')
            unlock_address = bech32_from_raw(rawAddressIn, netid)
            #print(unlock_address)
            logger.info(f'Offer Accept process started by {unlock_address} for offer: {offerUtxo}')
            #print(unlock_address)
            #assetUtxos,inUtxos,unlock_policy,unlock_name,unlock_amount
            ###---multiExperiment------
            unsigned_cbor = buildAcceptTx(offerUtxo,chain_context,unlock_address,utxoList,assetUtxos,usedAddresses,collateralHex,logger)
            #print(inUtxos)
            #unsigned_cbor = buildAcceptTx(offerUtxo,chain_context,unlock_address,utxoList)
            response = jsonify({"Cbor_to_sign": unsigned_cbor })
        except Exception as e:
            response = jsonify({"Cbor_to_sign": 'Error' })
            print(e)
            logger.error(e)
        return response
    else:
        return 'Error',403

@app.route('/flaskCancelOrder', methods=['POST'])
def flaskCancelOrder():
    reqAuth = request.headers.get("Auth")
    if reqAuth == FLASKAUTH:
        try:
            reqIn = request.get_json()
            netid = reqIn['NetworkId']
            rawAddressIn = reqIn['rawaddress']
            pk = rawAddressIn[2:58]
            utxoList = reqIn['utxoList']['utxo']
            offer_utxo = reqIn['offerUtxo']
            usedAddresses = reqIn['usedAddresses']
            assetUtxos = reqIn['assetUtxos']['assets']
            #print(offer_utxo)
            unlock_address = bech32_from_raw(rawAddressIn, netid)
            #print(unlock_address)
            unsigned_cbor = buildCancelTx(offer_utxo,chain_context,unlock_address,utxoList,assetUtxos,usedAddresses,logger)
            #print(inUtxos) 
            response = jsonify({"Cbor_to_sign": unsigned_cbor })
        except Exception as e:
            response = jsonify({"Cbor_to_sign": 'Error' })
            print(e)
            logger.error(e)
        return response
    else:
        return 'Error',403

@app.route('/flaskProcessUtxos', methods=['POST'])
def processUtxos():
    reqAuth = request.headers.get("Auth")
    if reqAuth == FLASKAUTH:
        try:
            raw_utxos = []
            nlist = []
            assetlist = []
            adaUtxos = []
            reqIn = request.get_json()
            #print(inUtxos) 
            for c in reqIn['cbor']:
                raw_utxos.append(UTxO.from_cbor(c))
            
            for u in raw_utxos:
                txhash = u.input.transaction_id.payload.hex()
                txid = str(u.input.index)
                if u.output.amount.multi_asset:
                    for a in u.output.amount.multi_asset:
                        policy = a.payload.hex()
                        asset = u.output.amount.multi_asset[a]
                        for n in asset:
                            try:
                                assetName = n.payload.decode()
                            except:
                                assetName = n.payload.decode('ascii','replace')
                            assetAmount = asset[n]
                            assetNameHex = str(n)

                            address = str(u.output.address)
                            
                            decimals = getDecimals(policy,assetNameHex)
                            #print(f'Asset {assetName} decimals {decimals}')
                            assetlist.append({'policy':policy,'assethex':assetNameHex,'amount':str(assetAmount),'assetname':assetName,'txhash':txhash,'txid':txid,'lovelace':str(u.output.amount.coin),'decimals':str(decimals)})
                            #nlist only allows unique entries
                #ADA Only
                #{"txhash": toHexString(test[0][0]),"txid":test[0][1].toString(),"lovelace":test[1][1]}
                else:
                    adaUtxos.append({'txhash': txhash,'txid':txid,'lovelace':u.output.amount.coin})
            #check for unique entries to create nlist
            for l in assetlist:
                exclude = False
                for c in nlist:
                    if l['policy'] == c['policy'] and l['assethex'] == c['assethex']:
                        exclude = True
                if not exclude:
                    nlist.append(l)
        
            #need a ada only utxo list also
            #consider just passing the CBOR back with the offer/buy order and scan through it then
            #consider adding address to type
            #type nfts = {policy: string; assethex: string; amount: string; assetname: string;txhash:string;txid:string;}
            print(f'{len(raw_utxos)} utxos in Wallet')
            response = jsonify({"nlist": nlist,"assetlist":{'assets':assetlist},'adaOnlyUtxos':{'utxo':adaUtxos}})
        except Exception as e:
            response = jsonify({"Error": 'Error' })
            print(e)
            #logger.error(e)
        return response
    else:
        return 'Error',403 

if __name__ == '__main__':
    app.run(host="0.0.0.0",port=5000)
