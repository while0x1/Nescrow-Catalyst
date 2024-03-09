from opshin.prelude import *

@dataclass()
class Listing(PlutusData):
    # the NFT which can unlock the escrowed NFT
    unlock_policy: bytes
    unlock_name: bytes
    amount: int
    # whoever is allowed to withdraw the listing
    owner: bytes
    stake_cred: bytes
    # marketplace fees
    fee: int
    cancel_fee: int
    fee_hash: bytes
    # unique order
    rnd: bytes

@dataclass()
class Buy(PlutusData):
    # Redeemer to buy the listed values
    CONSTR_ID = 0

@dataclass()
class Unlist(PlutusData):
    # Redeemer to unlist the values
    CONSTR_ID = 1

ListingAction = Union[Buy, Unlist]

def correct_buyer(txouts: List[TxOut],datum: Listing) -> None:
    pk_ok = False
    stake_ok = False
    for txo in txouts:
        if txo.value.get(datum.unlock_policy, {b"": 0}).get(datum.unlock_name, 0) == datum.amount:
            if txo.address.payment_credential.credential_hash == datum.owner:
                if txo.datum == SomeOutputDatum(datum.rnd):
                        pk_ok = True
            stake_cred = txo.address.staking_credential
            if isinstance(stake_cred, SomeStakingCredential):
                some_sc = stake_cred.staking_credential
                if isinstance(some_sc,StakingHash):
                    if some_sc.value.credential_hash == datum.stake_cred:
                        stake_ok = True
            if isinstance(stake_cred, NoStakingCredential):
                stake_ok = True
    assert pk_ok and stake_ok, "Swap assets not found or bad credentials"

def has_paid(txouts: List[TxOut], payhash: PubKeyHash, fee: int) -> None:
    res = False
    for txo in txouts:
        if txo.value.get(b"", {b"":0}).get(b"",0) == fee:
            cred = txo.address.payment_credential
            pkh = cred.credential_hash
            if pkh == payhash:
                res = True
    assert res, "Incorrect Address/Amount Used"

def check_spent_utxos(txins: List[TxInInfo], addr: Address) -> None:
    count = 0
    res = False
    for txi in txins:
        if txi.resolved.address == addr:
            count += 1
    if count < 3:
        res = True
    assert res, "Max 2 contract utxos allowed"
    #end

def check_owner_signed(signatories: List[PubKeyHash], owner: PubKeyHash) -> None:
    assert owner in signatories, "Owner did not sign transaction"

def validator(datum: Listing, redeemer: ListingAction, context: ScriptContext) -> None:
    purpose = context.purpose
    tx_info = context.tx_info
    if isinstance(purpose, Spending):
        own_utxo = resolve_spent_utxo(tx_info.inputs, purpose)
        own_addr = own_utxo.address
    else:
        assert False, "Wrong script purpose"

    check_spent_utxos(tx_info.inputs, own_addr)

    if isinstance(redeemer, Buy):
        correct_buyer(tx_info.outputs,datum)
        has_paid(tx_info.outputs,datum.fee_hash,datum.fee)

    elif isinstance(redeemer, Unlist):
        check_owner_signed(tx_info.signatories, datum.owner)
        has_paid(tx_info.outputs,datum.fee_hash,datum.cancel_fee)
    else:
        assert False, "Wrong redeemer"
