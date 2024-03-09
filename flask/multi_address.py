import json
import requests
from pycardano import Address

def multi_address(assetUtxos,inUtxos,offerLovelace,offeredAsset,lovelace_required):
    utxos_to_use = []
    asset_amount_counter = 0
    lovelace_counter = 0
    #fees,lock into contract,minUtxo For returning assets/ada

    max_hash = ''
    max_coin = 0

    #find the max_hash and coin
    for n in assetUtxos:
        if int(n['lovelace']) > max_coin:
            max_coin = int(n['lovelace'])
            max_hash = n['txhash']+'#'+ n['txid']
    #Fin#
    for n in inUtxos:
        if int(n['lovelace']) > max_coin:
            max_coin = int(n['lovelace'])
            max_hash = n['txhash']+'#'+ n['txid']
    utxos_to_use.append(max_hash)
    print(max_hash)

    ## --- for offering assets dont need to find collateral, just fees, but for canceling or accepting you will need to find collateral!
    if offerLovelace == 0:
        for n in assetUtxos:
                #offeringAsset
                if int(asset_amount_counter) < int(offeredAsset['amount']):
                    if offeredAsset['policy'] == n['policy'] and offeredAsset['assethex'] == n['assethex'] and n['txhash']+'#'+ n['txid'] not in utxos_to_use :
                        utxos_to_use.append(n['txhash']+'#'+ n['txid'])
                        asset_amount_counter += int(n['amount'])
                        lovelace_counter += int(n['lovelace'])
                if lovelace_counter < lovelace_required:
                    if n['txhash']+'#'+ n['txid'] not in utxos_to_use:
                        utxos_to_use.append(n['txhash']+'#'+ n['txid'])
                        lovelace_counter += int(n['lovelace'])
                if asset_amount_counter > int(offeredAsset['amount']) and lovelace_counter > lovelace_required:
                    break
        if lovelace_counter < lovelace_required:
            #iterate over Ada Only Utxos
            for n in inUtxos:
                if  lovelace_counter < lovelace_required and n['txhash']+'#'+ n['txid'] not in utxos_to_use:
                    utxos_to_use.append(n['txhash']+'#'+ n['txid'])
                    lovelace_counter += int(n['lovelace'])
                else:
                    break
    else:
        ##offeringAda
        #First Iterate over AdaUtxos
        for n in inUtxos:
            if offerLovelace + lovelace_required < lovelace_counter and n['txhash']+'#'+ n['txid'] not in utxos_to_use:
                utxos_to_use.append(n['txhash']+'#'+ n['txid'])
                lovelace_counter += int(n['lovelace'])
            else:
                break
        if offerLovelace + lovelace_required < lovelace_counter:
            #still Not Enough Ada - Iterate over assetUtxos
            for n in assetUtxos:
                if n['txhash']+'#'+ n['txid'] not in utxos_to_use:
                    if offerLovelace + lovelace_required < lovelace_counter:
                        utxos_to_use.append(n['txhash']+'#'+ n['txid'])
                        lovelace_counter += int(n['lovelace'])
                    else:
                        break
    #"https://api.koios.rest/api/v1/utxo_info"
    #"_utxo_refs":["f144a8264acf4bdfe2e1241170969c930d64ab6b0996a4a45237b623f1dd670e#0"
    #req_hashs = []                
    
    #for n in utxos_to_use:
    #    req_hashs.append(n[0:len(n) - 2])

    #url = 'https://api.koios.rest/api/v0/tx_utxos'
    url = 'https://api.koios.rest/api/v1/utxo_info'
    #pdata = {'_tx_hashes': [req_hashs]}
    pdata = {'_utxo_refs': [utxos_to_use]}

    for n in range(1,4):
        r = requests.post(url, json = pdata)
        print(f'Data fetch Attempt {n}')
        if r.status_code == 200:
            r_json = json.loads(r.content)
            break
    include_addresses = []

    for u in utxos_to_use:
        for r in r_json:
            #if r['tx_hash'] == u[0:len(u)-2]:
            if r['tx_hash'] == u[0:len(u)-2] and r['tx_index'] == int(u[len(u) - 1 :]):
                #print(q['payment_addr']['bech32'])
                print(r['address'])
                include_addresses.append(r['address'])
                #include_addresses.append(q['payment_addr']['bech32'])
            #for q in r['outputs']:  
                #if q['tx_hash'] == u[0:len(u)-2] and q['tx_index'] == int(u[len(u) - 1 :]):
                    #print(q['payment_addr']['bech32'])
                    #include_addresses.append(q['payment_addr']['bech32'])
    return include_addresses

def multi_address_unlock(assetUtxos,inUtxos,unlock_policy,unlock_name,unlock_amount):
    utxos_to_use = []
    asset_amount_counter = 0
    lovelace_counter = 0
    lovelace_required = 5000000 + 2000000 + 2500000
    #fees,lock into contract,minUtxo For returning assets/ada
    collateral_found = False
    max_hash = ''
    max_coin = 0


    #find the max_hash and coin
    for n in assetUtxos:
        if int(n['lovelace']) > max_coin:
            max_coin = int(n['lovelace'])
            max_hash = n['txhash']+'#'+ n['txid']
    #Fin#
    for n in inUtxos:
        if int(n['lovelace']) > max_coin:
            max_coin = int(n['lovelace'])
            max_hash = n['txhash']+'#'+ n['txid']
    utxos_to_use.append(max_hash)
    print(max_hash)

    ## --- for offering assets dont need to find collateral, just fees, but for canceling or accepting you will need to find collateral!
    if unlock_policy != '':
        for n in assetUtxos:
                #Swapping Assets
                if int(asset_amount_counter) < int(unlock_amount):
                    if unlock_policy == n['policy'] and unlock_name == n['assethex'] and n['txhash']+'#'+ n['txid'] not in utxos_to_use :
                        utxos_to_use.append(n['txhash']+'#'+ n['txid'])
                        asset_amount_counter += int(n['amount'])
                        lovelace_counter += int(n['lovelace'])
                if lovelace_counter < lovelace_required:
                    if n['txhash']+'#'+ n['txid'] not in utxos_to_use:
                        utxos_to_use.append(n['txhash']+'#'+ n['txid'])
                        lovelace_counter += int(n['lovelace'])
                if asset_amount_counter > int(unlock_amount) and lovelace_counter > lovelace_required:
                    break
        if lovelace_counter < lovelace_required:
            #iterate over Ada Only Utxos
            for n in inUtxos:
                if  lovelace_counter < lovelace_required and n['txhash']+'#'+ n['txid'] not in utxos_to_use:
                    utxos_to_use.append(n['txhash']+'#'+ n['txid'])
                    lovelace_counter += int(n['lovelace'])
                else:
                    break
        #find a collateral UTXO

    #Fin#
        for n in inUtxos:
            if int(n['lovelace']) >= 5000000 and n['txhash']+'#'+ n['txid'] not in utxos_to_use:
                utxos_to_use.append(n['txhash']+'#'+ n['txid'])
                collateral_found = True
                print('collateral found')
                break
        if not collateral_found:
            for n in assetUtxos:
                if int(n['lovelace']) >= 5000000 and n['txhash']+'#'+ n['txid'] not in utxos_to_use:
                    utxos_to_use.append(n['txhash']+'#'+ n['txid'])
                    collateral_found = True
                    print('collateral found')
                    break
            
    else:
        ##offeringAda
        #First Iterate over AdaUtxos

        for n in inUtxos:
            if int(unlock_amount) + lovelace_required < lovelace_counter and n['txhash']+'#'+ n['txid'] not in utxos_to_use:
                utxos_to_use.append(n['txhash']+'#'+ n['txid'])
                lovelace_counter += int(n['lovelace'])
            else:
                break

        if int(unlock_amount) + lovelace_required < lovelace_counter:
            #still Not Enough Ada - Iterate over assetUtxos
            for n in assetUtxos:
                if n['txhash']+'#'+ n['txid'] not in utxos_to_use:
                    if int(unlock_amount) + lovelace_required < lovelace_counter:
                        utxos_to_use.append(n['txhash']+'#'+ n['txid'])
                        lovelace_counter += int(n['lovelace'])
                    else:
                        break
        
        #Find Collateral
        for n in inUtxos:
            print(n)
            if int(n['lovelace']) >= 5000000 and n['txhash']+'#'+ n['txid'] not in utxos_to_use:
                utxos_to_use.append(n['txhash']+'#'+ n['txid'])
                collateral_found = True
                print('collateral found')
                break
        if not collateral_found:
            for n in assetUtxos:
                if int(n['lovelace']) >= 5000000 and n['txhash']+'#'+ n['txid'] not in utxos_to_use:
                    utxos_to_use.append(n['txhash']+'#'+ n['txid'])
                    collateral_found = True
                    print('collateral found')
                    break
        
    req_hashs = []                
    #for n in utxos_to_use:
    #    req_hashs.append(n[0:len(n) - 2])

    #url = 'https://api.koios.rest/api/v0/tx_utxos'
    #pdata = {'_tx_hashes': [req_hashs]}
    
    url = 'https://api.koios.rest/api/v1/utxo_info'
    pdata = {'_utxo_refs': [utxos_to_use]}

    for n in range(1,4):
        r = requests.post(url, json = pdata)
        print(f'Data fetch Attempt {n}')
        if r.status_code == 200:
            r_json = json.loads(r.content)
            break
    include_addresses = []

    for u in utxos_to_use:
        for r in r_json:
            if r['tx_hash'] == u[0:len(u)-2] and r['tx_index'] == int(u[len(u) - 1 :]):
                print(r['address'])
                include_addresses.append(r['address'])
            #if r['tx_hash'] == u[0:len(u)-2]:
            #    for q in r['outputs']:  
            #        if q['tx_hash'] == u[0:len(u)-2] and q['tx_index'] == int(u[len(u) - 1 :]):
            #            print(q['payment_addr']['bech32'])
            #            include_addresses.append(q['payment_addr']['bech32'])

    return include_addresses

def multi_address_cancel(assetUtxos,inUtxos):
    utxos_to_use = []
    lovelace_counter = 0
    lovelace_required = 2000000 + 1500000
    collateral_found = False
    fees_found = False
    #fees,lock into contract,minUtxo For returning assets/ada
    #Find Collateral
    for n in inUtxos:
        if int(n['lovelace']) >= 5000000 and n['txhash']+'#'+ n['txid'] not in utxos_to_use:
            utxos_to_use.append(n['txhash']+'#'+ n['txid'])
            collateral_found = True
            print('collateral found')
            break
        if not collateral_found:
            for n in assetUtxos:
                if int(n['lovelace']) >= 5000000 and n['txhash']+'#'+ n['txid'] not in utxos_to_use:
                    utxos_to_use.append(n['txhash']+'#'+ n['txid'])
                    collateral_found = True
                    print('collateral found')
                    break
    #Find Fees
    for n in inUtxos:
        if int(n['lovelace']) >= lovelace_required and n['txhash']+'#'+ n['txid'] not in utxos_to_use:
            utxos_to_use.append(n['txhash']+'#'+ n['txid'])
            fees_found = True
            print('fees utxo found')
            break
        if not fees_found:
            for n in assetUtxos:
                if int(n['lovelace']) >= lovelace_required and n['txhash']+'#'+ n['txid'] not in utxos_to_use:
                    utxos_to_use.append(n['txhash']+'#'+ n['txid'])
                    collateral_found = True
                    print('fees utxo found')
                    break
    
    req_hashs = []                
    #for n in utxos_to_use:
    #    req_hashs.append(n[0:len(n) - 2])

    #url = 'https://api.koios.rest/api/v0/tx_utxos'
    #pdata = {'_tx_hashes': [req_hashs]}
    
    ##NEW KOIS ENDPOINT ============================
    url = 'https://api.koios.rest/api/v1/utxo_info'
    pdata = {'_utxo_refs': [utxos_to_use]}

    for n in range(1,4):
        r = requests.post(url, json = pdata)
        print(f'Data fetch Attempt {n}')
        if r.status_code == 200:
            r_json = json.loads(r.content)
            break
    include_addresses = []

    for u in utxos_to_use:
        for r in r_json:
            if r['tx_hash'] == u[0:len(u)-2] and r['tx_index'] == int(u[len(u) - 1 :]):
                print(r['address'])
                include_addresses.append(r['address'])
            #if r['tx_hash'] == u[0:len(u)-2]:
            #    for q in r['outputs']:  
            #        if q['tx_hash'] == u[0:len(u)-2] and q['tx_index'] == int(u[len(u) - 1 :]):
            #            print(q['payment_addr']['bech32'])
            #            include_addresses.append(q['payment_addr']['bech32'])

    return include_addresses