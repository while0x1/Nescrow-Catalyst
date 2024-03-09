import requests
import json
from v3_nescrow_dex import Listing
from static_var import *
from token_registry import *

def get_script_utxos():
    script_utxos = []
    for n in range(0,3):
        try:
            r = requests.get(BASE_URL + 'addresses/' + SCRIPT_ADDR + '/utxos', headers= BF_HEADERS)
            jres = json.loads(r.content)
            if r.status_code == 200:
                break
        except Exception as e:
            print(e)
    print(jres)
    for n in jres:
        if n['inline_datum'] is not None:
            datum = Listing.from_cbor(n['inline_datum'])
            unlock_policy = datum.unlock_policy.hex()
            unlock_name = datum.unlock_name.hex()
            print(unlock_policy)
            print(unlock_name)
            if unlock_name == '4b7641ae8f6b6c4975cc59f19e95c0609961031bbf412f003d4366c44d4143482d4f43502d35363732303438':
                unlock_name_utf = 'MACH-OCP-5672048'
            else:
                try:
                    unlock_name_utf = datum.unlock_name.decode()
                except Exception as e:
                    print('Decode Error')
                    unlock_name_utf = 'UNKNOWN'
            print(unlock_name_utf)
            owner = datum.owner.hex()
            stake_cred = datum.stake_cred.hex()
            unlock_amount = str(datum.amount)
            rnd = datum.rnd.hex()
            #print(f'Unique Datum Id {rnd}')
            nft_offer_p = ''
            nft_offer_n = ''
            nft_offer_name = ''
            offerImg = ''
            lockedAssetAmount = ''
            ada = str(float(n['amount'][0]['quantity'])/1000000)
            if len(n['amount']) > 1:
                nft_offer = n['amount'][1]['unit']
                lockedAssetAmount = str(n['amount'][1]['quantity'])
                nft_offer_name = bytes.fromhex(n['amount'][1]['unit'][56:]).decode()
                try:
                    r = requests.get(BASE_URL + 'assets/' + nft_offer, headers= BF_HEADERS)
                    js = json.loads(r.content)
                    if js['onchain_metadata'] is not None:
                        ipfs = js['onchain_metadata']['image']
                        if ipfs[0] == 'i':
                            ipfs = ipfs[7:]
                        offerImg = 'https://cloudflare-ipfs.com/ipfs/' + ipfs
                except Exception as e:
                    print(e)
                    offerImg = 'Error'
                #'nft_offer_policy': nft_offer[0:56],'nft_offer_hexname':nft_offer[56:]
                
                unlock_decimals = getDecimals(unlock_policy,unlock_name)
                locked_decimals = getDecimals(nft_offer[0:56],nft_offer[56:])

                script_utxos.append({'tx_hash': n['tx_hash'], 'tx_id': n['tx_index'], 'datum_hash':n['data_hash'] , 'amount': n['amount'], 'unlock_policy': unlock_policy, 'unlock_name': unlock_name, 'lockedAssetAmount':lockedAssetAmount, 'owner':owner, 'nft_offer_policy': nft_offer[0:56],'nft_offer_hexname':nft_offer[56:],'nft_offer_name':nft_offer_name,'offer_img':offerImg,'unlock_name_utf':unlock_name_utf,'lovelace': ada,'unlock_amount':unlock_amount,'stake_cred':stake_cred,'rnd':rnd,'unlock_decimals':str(unlock_decimals),'locked_decimals': str(locked_decimals)})
            else:
                unlock_decimals = getDecimals(unlock_policy,unlock_name)
                locked_decimals = getDecimals(nft_offer[0:56],nft_offer[56:])
                script_utxos.append({'tx_hash': n['tx_hash'], 'tx_id': n['tx_index'], 'datum_hash':n['data_hash'] , 'amount': n['amount'], 'unlock_policy': unlock_policy, 'unlock_name': unlock_name, 'lockedAssetAmount':lockedAssetAmount, 'owner':owner, 'nft_offer_policy': nft_offer_p,'nft_offer_hexname':nft_offer_n,'nft_offer_name':nft_offer_n,'offer_img':offerImg,'unlock_name_utf':unlock_name_utf,'lovelace': ada,'unlock_amount':unlock_amount,'stake_cred':stake_cred,'rnd':rnd,'unlock_decimals':str(unlock_decimals),'locked_decimals': str(locked_decimals)})
    return script_utxos