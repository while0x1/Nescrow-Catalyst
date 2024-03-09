from pycardano import VerificationKeyHash,  Network, Address

def bech32_from_raw(raw,netid):
    full_addr = bytes.fromhex(raw)
    
    if str(netid) == '0':
        pynetwork = Network.TESTNET
    else:
        pynetwork = Network.MAINNET
    payment_hash = VerificationKeyHash(full_addr[1:29])
    if len(full_addr) > 29:
            staking_hash = VerificationKeyHash(full_addr[29:])
    else:
            staking_hash = None
    addr = Address(payment_hash, staking_hash,network=pynetwork).encode()
    return addr