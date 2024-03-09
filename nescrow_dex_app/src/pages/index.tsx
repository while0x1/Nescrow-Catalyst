
import { useState, useEffect, useCallback, Key, JSXElementConstructor, ReactElement, ReactFragment, ReactPortal, ChangeEvent, SetStateAction} from "react";
import type { NextPage } from "next";
import { Alert, Avatar, MenuList, OutlinedInput, CardMedia, Slider, Link,Typography, CardActions, Icon, Box, InputLabel, NativeSelect, Select, SelectChangeEvent, TextField, MenuItem, Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText,Switch, FormGroup, FormControlLabel, FormControl, FormLabel, } from '@mui/material';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import CircularProgress from '@mui/material/CircularProgress';
import CancelPresentationIcon from '@mui/icons-material/CancelPresentation';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Head from 'next/head'
import Image from 'next/image'
import styles from '@/styles/Home.module.css'
import {styled } from '@mui/material/styles';
import { Api, Category, CenterFocusStrong, ColorLensOutlined } from "@mui/icons-material";
import { maxWidth } from "@mui/system";

export default function Home() {
  
  const cbor = require('cbor')
  
  type mywallet = {apiVersion: string; icon: string; name: string; id: string;}
  type nfts = {policy: string; assethex: string; amount: string; assetname: string;txhash:string;txid:string;decimals: string}
  type offutxo = {datum_hash: string, owner: string,tx_hash: string, tx_id: string ,unlock_name: string, lockedAssetAmount: string,unlock_policy:string, nft_offer_policy:string,nft_offer_hexname:string,nft_offer_name:string,offer_img:string,unlock_name_utf:string, lovelace:string,unlock_amount: string, stake_cred:string, rnd: string, unlock_decimals: string,locked_decimals:string}
  type tokenreg = {'currency': string,'policy':string,'hexname':string,'officialname':string,'img':string,'decimals':number};
  const [wallets, setWallets] = useState<mywallet[]>();
  const onConnectWalletShow = async () => {setShowConnectWallet(true);};
  const [currentWalletApi, setCurrentWalletApi] = useState<any>();
  const [showConnectWallet, setShowConnectWallet] = useState<boolean>(false);
  const [currentWallet, setCurrentWallet] = useState<mywallet>();
  const [walletconnected, setWalletConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [networkid, setNetworkid] = useState<null | any>(null);
  const [networkdialog , setNetworkdialog] = useState<boolean>(false);
  const [makeofferdialog , setMakeOfferDialog] = useState<boolean>(false);
  const [balance, setBalance] = useState<number>(0);
  const [utxoobj, setUtxoObj] = useState<any>();
  const [nftobj, setNftObj] = useState<nfts[]>();
  const [balancedialog, setBalancedialog] = useState<boolean>(false);
  const [rawaddress, setRawAddress] = useState<null | string>(null);
  const [pk, setPk] = useState<null | string>('');
  /*OfferVars*/  
  const [offerswitch, setOfferSwitch] = useState<boolean>(false);
  const [offervalue, setOfferValue] = useState<string>('');
  const [offerAssetAmount, setOfferAssetAmount] = useState<string>('');
  const [bidAmountRequested, setBidAmountRequested] = useState<string>('');
  const initialValue = ''; 
  const placeholder = 'Enter ADA offer...';
  const offerToggleFx = () => {setOfferSwitch((prev) => !prev);setOfferImg('');setOfferNftName('');setOfferAssetAmount('1');setIpfsError(false);setOfferNftHexName('');setOfferNftPolicy('');setOfferNftObj('');setOfferValue('');setInvalidOfferAlert(false);};
  const [offerNftName, setOfferNftName] = useState<string>('');
  const [offerNftHexName, setOfferNftHexName] = useState<string>('');
  const [offerNftPolicy, setOfferNftPolicy] = useState<string>('');
  const [offerNftObj, setOfferNftObj] = useState<any>();
  const [offerimg, setOfferImg] = useState<string>('');
  const [bidimg, setBidImg] = useState<string>('');
  const [bidPolicy, setBidPolicy] = useState<string>('');
  const [bidName, setBidName] = useState<string>('');
  const [ipfsReqStat, setIpfsReqStat] = useState<boolean>(false);
  const [ipfsError, setIpfsError] = useState<boolean>(false);
  const [BF_HEADERS, setBF_HEADERS] = useState<any>();
  const [BF_BASE_URL, setBF_BASE_URL] = useState<string>('');
  const [submitDialog, setSubmitDialog] = useState<boolean>(false);
  const [alertstate, setAlertState] = useState<boolean>(false);
  const [txsubmitstate, setTxsubmitstate] = useState<boolean>(false);
  const [txId, setTxId] = useState<null | string>(null);
  const [seeoffersdialog , setSeeOffersDialog] = useState<boolean>(false);
  const [offeredUtxos, setOfferedUtxos] = useState<offutxo[]>();
  const [filterOfferUtxos, setFilterOfferUtxos] = useState<offutxo[]>();
  const [walletdelay, setWalletDelay] = useState<boolean>(true);
  const [offeredimg, setOfferedImg] = useState<string>('');
  const [escrowdialog , setEscrowDialog] = useState<boolean>(false);
  const [escrowUtxos, setEscrowUtxos] = useState<offutxo[]>();
  const [invalidOfferAlert, setInvalidOfferAlert] = useState<boolean>(false);
  const [sliderVal, setSliderVal] = useState<number | Array<number>>(0);
  const [tokenSelectorVal, setTokenSelectorVal] = useState<string>('');
  const [collateralAlarm, setCollateralAlarm] = useState<boolean>(true);
  const [bidSwitch,setBidSwitch] = useState<boolean>(true);
  const [adaOnlyBalance,setAdaOnlyBalance] = useState<Number>(0);
  const bidToggleFx = () => {setBidSwitch((prev) => !prev);setBidName('');setBidPolicy('');};
  const [usedAddresses, setUsedAddresses] = useState<Array<string>>(['']);
  const [assetUtxos, setAssetUtxos] = useState<any>();
  const [collateralHex, setCollateralHex] = useState<string>('');
  const [loadingdialog, setLoadingDialog] = useState<boolean>(false);
  const [cborUtxos, setCborUtxos] = useState<string[]>();
  const [aboutdialog , setAboutDialog] = useState<boolean>(true);
  const [searchBox, setSearchBox] = useState<string>('');

  const tokenReg: tokenreg[] = [
    {'currency' : 'MIN' ,  'policy' : '29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6' , 'hexname' : '4d494e' , 'img' : '/MIN.png' , 'officialname' : '' , 'decimals' : 6},
    {'currency' : 'MACH' ,  'policy' : 'b9939a9b1a3b21098114cf8c0d21d1f5db7313f59592e78d1d4ccdc3' , 'hexname' : '4d414348' , 'img' : '/MACH.png' , 'officialname' : '' , 'decimals' : 0},
    {'currency' : 'KNFTY' ,  'policy' : 'c5eba81b126522687cc4eefdd606a1e592700f5c326fb2cb704c8e4f' , 'hexname' : '4b4e465459' , 'img' : '/KNFTY.png' , 'officialname' : '' , 'decimals' : 5},
    {'currency' : 'TUNA' ,  'policy' : '279f842c33eed9054b9e3c70cd6a3b32298259c24b78b895cb41d91a' , 'hexname' : '54554e41' , 'img' : '/TUNA.png' , 'officialname' : '','decimals': 8},
    {'currency': 'OPT','policy': '1ddcb9c9de95361565392c5bdff64767492d61a96166cb16094e54be','hexname':'4f5054','img':"/OPT.png",'officialname':'','decimals': 6},
    {'currency': 'LIFI','policy': '7914fae20eb2903ed6fd5021a415c1bd2626b64a2d86a304cb40ff5e','hexname':'4c494649','img':"/LIFI.png",'officialname':'','decimals': 6},
    {'currency' : 'PAVIA' ,  'policy' : '884892bcdc360bcef87d6b3f806e7f9cd5ac30d999d49970e7a903ae' , 'hexname' : '5041564941' , 'img' : '/PAVIA.png' , 'officialname' : '' , 'decimals' : 0},
    {'currency' : 'cNETA' ,  'policy' : 'b34b3ea80060ace9427bda98690a73d33840e27aaa8d6edb7f0c757a' , 'hexname' : '634e455441' , 'img' : '/cNETA.png' , 'officialname' : '' , 'decimals' : 0},
    {'currency' : 'HOSKY' ,  'policy' : 'a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235' , 'hexname' : '484f534b59' , 'img' : '/HOSKY.png' , 'officialname' : '' , 'decimals' : 0},
    {'currency' : 'DRIP' ,  'policy' : 'af2e27f580f7f08e93190a81f72462f153026d06450924726645891b' , 'hexname' : '44524950' , 'img' : '/DRIP.png' , 'officialname' : '' , 'decimals' : 6},
    {'currency' : 'AGIX' ,  'policy' : 'f43a62fdc3965df486de8a0d32fe800963589c41b38946602a0dc535' , 'hexname' : '41474958' , 'img' : '/AGIX.png' , 'officialname' : '' , 'decimals' : 8},
    {'currency' : 'WMT' ,  'policy' : '1d7f33bd23d85e1a25d87d86fac4f199c3197a2f7afeb662a0f34e1e' , 'hexname' : '776f726c646d6f62696c65746f6b656e' , 'img' : '/WMT.png' , 'officialname' : '', 'decimals' : 6},
    {'currency' : 'MELD' ,  'policy' : '6ac8ef33b510ec004fe11585f7c5a9f0c07f0c23428ab4f29c1d7d10' , 'hexname' : '4d454c44' , 'img' : '/MELD.png' , 'officialname' : '' , 'decimals' : 6},
    {'currency' : 'AADA' ,  'policy' : '8fef2d34078659493ce161a6c7fba4b56afefa8535296a5743f69587' , 'hexname' : '41414441' , 'img' : '/AADA.png' , 'officialname' : '' , 'decimals' : 6},
    {'currency' : 'NTX' ,  'policy' : 'edfd7a1d77bcb8b884c474bdc92a16002d1fb720e454fa6e99344479' , 'hexname' : '4e5458' , 'img' : '/NTX.png' , 'officialname' : '' , 'decimals' : 6},
    {'currency' : 'LQ' ,  'policy' : 'da8c30857834c6ae7203935b89278c532b3995245295456f993e1d24' , 'hexname' : '4c51' , 'img' : '/LQ.png' , 'officialname' : '' , 'decimals' : 6},
    {'currency' : 'SHEN' ,  'policy' : '8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd61' , 'hexname' : '5368656e4d6963726f555344' , 'img' : '/SHEN.png' , 'officialname' : '' , 'decimals' : 6},
    {'currency' : 'COPI' ,  'policy' : 'b6a7467ea1deb012808ef4e87b5ff371e85f7142d7b356a40d9b42a0' , 'hexname' : '436f726e75636f70696173205b76696120436861696e506f72742e696f5d' , 'img' : '/COPI.png' , 'officialname' : '' , 'decimals' : 6},
    {'currency' : 'INDY' ,  'policy' : '533bb94a8850ee3ccbe483106489399112b74c905342cb1792a797a0' , 'hexname' : '494e4459' , 'img' : '/INDY.png' , 'officialname' : '' , 'decimals' : 6},
    {'currency' : 'SOCIETY' ,  'policy' : '25f0fc240e91bd95dcdaebd2ba7713fc5168ac77234a3d79449fc20c' , 'hexname' : '534f4349455459' , 'img' : '/SOCIETY.png' , 'officialname' : '' , 'decimals' : 6},
    {'currency' : 'CLAY' ,  'policy' : '38ad9dc3aec6a2f38e220142b9aa6ade63ebe71f65e7cc2b7d8a8535' , 'hexname' : '434c4159' , 'img' : '/CLAY.png' , 'officialname' : '' , 'decimals' : 4},
    {'currency' : 'DJED' ,  'policy' : '8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd61' , 'hexname' : '446a65644d6963726f555344' , 'img' : '/DJED.png' , 'officialname' : '' , 'decimals' : 6},
    {'currency' : 'iUSD' ,  'policy' : 'f66d78b4a3cb3d37afa0ec36461e51ecbde00f26c8f0a68f94b69880' , 'hexname' : '69555344' , 'img' : '/iUSD.png' , 'officialname' : '' , 'decimals' : 6},
    {'currency' : 'MCOS' ,  'policy' : '6f46e1304b16d884c85c62fb0eef35028facdc41aaa0fd319a152ed6' , 'hexname' : '4d434f53' , 'img' : '/MCOS.png' , 'officialname' : '' , 'decimals' : 6},
    {'currency' : 'NMKR' ,  'policy' : '5dac8536653edc12f6f5e1045d8164b9f59998d3bdc300fc92843489' , 'hexname' : '4e4d4b52' , 'img' : '/NMKR.png' , 'officialname' : '' , 'decimals' : 6},
    {'currency' : 'iBTC' ,  'policy' : 'f66d78b4a3cb3d37afa0ec36461e51ecbde00f26c8f0a68f94b69880' , 'hexname' : '69425443' , 'img' : '/iBTC.png' , 'officialname' : '' , 'decimals' : 6},
    {'currency' : 'MILK' ,  'policy' : '8a1cfae21368b8bebbbed9800fec304e95cce39a2a57dc35e2e3ebaa' , 'hexname' : '4d494c4b' , 'img' : '/MILK.png' , 'officialname' : '' , 'decimals' : 0},
    {'currency' : 'qADA' ,  'policy' : 'a04ce7a52545e5e33c2867e148898d9e667a69602285f6a1298f9d68' , 'hexname' : 'EMPTY' , 'img' : '/qADA.png' , 'officialname' : '' , 'decimals' : 6},
    {'currency' : 'iETH' ,  'policy' : 'f66d78b4a3cb3d37afa0ec36461e51ecbde00f26c8f0a68f94b69880' , 'hexname' : '69455448' , 'img' : '/iETH.png' , 'officialname' : '' , 'decimals' : 6},
    {'currency' : 'GENS' ,  'policy' : 'dda5fdb1002f7389b33e036b6afee82a8189becb6cba852e8b79b4fb' , 'hexname' : '0014df1047454e53' , 'img' : '/GENS.png' , 'officialname' : '' , 'decimals' : 6},
    {'currency' : 'EMP' ,  'policy' : '6c8642400e8437f737eb86df0fc8a8437c760f48592b1ba8f5767e81' , 'hexname' : '456d706f7761' , 'img' : '/EMP.png' , 'officialname' : '' , 'decimals' : 6},
    {'currency' : 'VYFI' ,  'policy' : '804f5544c1962a40546827cab750a88404dc7108c0f588b72964754f' , 'hexname' : '56594649' , 'img' : '/VYFI.png' , 'officialname' : '' , 'decimals' : 6},
    {'currency' : 'DEAN' ,  'policy' : 'fb0e9a083ac66c814548002cbdfc54557e064e4cdf5c6675e72d22b4' , 'hexname' : '4445414e' , 'img' : '/DEAN.png' , 'officialname' : '' , 'decimals' : 0},
    {'currency' : 'SNEK' ,  'policy' : '279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3f' , 'hexname' : '534e454b' , 'img' : '/SNEK.png' , 'officialname' : '', 'decimals' : 0}
    ]

    function searchFx(searchStr:string){
      const filtList : offutxo[] = [];
      if(offeredUtxos != undefined){
        offeredUtxos?.map(utxo => {
            if(utxo.nft_offer_name.search(searchStr) > -1 || utxo.unlock_name_utf.search(searchStr) > -1 ){
              filtList.push(utxo);
            }
      })
      setFilterOfferUtxos(filtList)
      }
    }
  // Deprecated Function now use searchFx instead of SlideFilter
  function slideFilter(value:number | number[],nftobj: nfts[]){
    const filtList : offutxo[] = [];

      console.log(filtList);
      if(value == 1){
      //Filter For NFTS
      //arr.filter(x => x.title.includes(searchStr));
      //const filter1 = offeredUtxos.filter((value) => Number(value.unlock_amount) < 2);
      //setFilterOfferUtxos(filter1);
      if(offeredUtxos != undefined){
        {nftobj?.map(nft => {
          offeredUtxos?.map(utxo => {
            if(utxo.unlock_policy == nft.policy && utxo.unlock_name == nft.assethex && (utxo.unlock_amount == '1' || utxo.lockedAssetAmount == '1')){
              filtList.push(utxo);
            }
          })
  
        })}
        setFilterOfferUtxos(filtList)
        }
      }
      else if(value == 2){
        //const filtered = offeredUtxos.filter((value) => Number(value.unlock_amount) > 1);
        //setFilterOfferUtxos(filtered) 
        if(offeredUtxos != undefined){
          {nftobj?.map(nft => {
            offeredUtxos?.map(utxo => {
              if(utxo.unlock_policy == nft.policy && utxo.unlock_name == nft.assethex && (utxo.unlock_amount != '1' || utxo.lockedAssetAmount != '1')){
                filtList.push(utxo);
              }
            })
    
          })}
          setFilterOfferUtxos(filtList)
          }

      }
      else{
        setFilterOfferUtxos(offeredUtxos);
      }
    }
  
    //const handleChange = (event: Event, newValue: number | number[]) => {
    //setValue(newValue as number[]);
    //};
    const handleSlide = (event: Event, newValue: number | number[]) => {
      setSliderVal(newValue);
      {nftobj != undefined &&
      slideFilter(newValue,nftobj);
      }
    };
  const customMarks = [{value: 0,label: 'Off',},{value: 1,label: 'NFT',},{value: 2,label: 'Tokens',}];
  const getIPFS = async (asset:any, offer: boolean) => {
    //'https://cardano-mainnet.blockfrost.io/api/v0/assets/' + assetUnit + '/'
    try{
    setLoading(true);
    const Request = await fetch(BF_BASE_URL.concat("assets/".concat(asset)),{headers: BF_HEADERS});
    const Response: string = await Request.json();
    if(Request.status == 200){
      setIpfsReqStat(true);
      let jsonObj = JSON.parse(JSON.stringify(Response));
      console.log(jsonObj);
      let ipfs = jsonObj.onchain_metadata.image
      if(ipfs[0] == 'i'){ipfs = ipfs.slice(7)}
      if(offer){setOfferImg('https://cloudflare-ipfs.com/ipfs/'.concat(ipfs));}
      else{setBidImg('https://cloudflare-ipfs.com/ipfs/'.concat(ipfs));}
      setIpfsError(false);
      }
    }
    catch{
      setIpfsError(true);
      setLoading(false);
    }
    setLoading(false);
  };

  const refreshWalletUtxos = async () => {
    setLoading(true);
    const ureffresh = await getUtxos(currentWalletApi);
    setLoading(false);
  }
  
  function aboutDHandler(){setAboutDialog(true);};

  function makeOfferDHandler(){setMakeOfferDialog(true);};
  const seeOffersDHandler = async () => {
    setLoading(true);
    setSeeOffersDialog(true);
    const rf = await refreshWalletUtxos();
    flaskFindScriptUtxos(rawaddress,networkid,utxoobj,offerNftObj,0);};
  
  const seeEscrowDHandler = async () =>{
    setLoading(true);
    setEscrowDialog(true);
    const rw = await refreshWalletUtxos();
    flaskFindScriptUtxos(rawaddress,networkid,utxoobj,offerNftObj,1);
    };

  function toHexString(byteArray: Uint8Array) {
    return Array.from(byteArray, function(byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
      }).join('')
    }
  
  const getWalletsAsync = async () => {
    const wal : mywallet[] = [];
    const cardano = (window as any).cardano;
    for (const i in cardano) {
      const p = cardano[i];
      if (p.apiVersion != null && p.icon != null && p.name != null && i !== "ccvault") {
        wal.push({
          apiVersion: p.apiVersion,
          icon: p.icon,
          name: p.name,
          id: i.toString()
        });
      }
    }
    setWallets(wal);
  }

  const onConnectWallet = async (wallet: mywallet) => {
    const api = await (window as any).cardano[wallet.id].enable();
    setLoading(true);
    setCurrentWalletApi(api);
    setCurrentWallet(wallet);
    setShowConnectWallet(false);
    getNetwork(api);
    getChangeAddress(api);
    getBalance(api);
    getUtxos(api);
    getCollateral(api);
    setLoading(false);
    setWalletConnected(true);

    //setFilterOfferUtxos([]);
    //setEscrowUtxos([]);
  }
  
  async function getNetwork(api: any) {
    if (wallets) {
      setLoading(true);
      const _network = await api.getNetworkId();
      setNetworkid(_network);
      setLoading(false);
      console.log('Network:',_network);
      if(_network){
        //Set for Preprod If mainnet will open Dialogue
        setBF_HEADERS({'project_id': 'your_blockfrost_key'});
        setBF_BASE_URL("https://cardano-mainnet.blockfrost.io/api/v0/");
      }
      else{
        console.log('HERE')
        setNetworkdialog(true);
        setBF_HEADERS({'project_id': 'your_preprod_key'});
        setBF_BASE_URL("https://cardano-preprod.blockfrost.io/api/v0/");
      }
    }
  }
  async function getBalance(api: any) {
    let balance: number = 0;
    if (wallets) {
      try{
      const _balance = await api.getBalance();
      let bal = cbor.decode(_balance)
      if (Array.isArray(bal)){
        balance = Math.floor(bal[0] / 1000000);

      }
      else{
        balance = bal / 1000000;
      }
      
      console.log('Balance:', balance)
      setBalance(balance);
      {/* if(balance < TICKET_COST + 5000000){//setBalancedialog(true);} */}
      }
      catch (e: any){
        console.log('Balance Retrieval Failure')
      }
    }
  }

  async function getCollateral(api: any) {
    if (wallets) {
      try{
      const _collateral = await api.getCollateral(5000000);
      setCollateralHex(_collateral[0])
      console.log('Collateral:', _collateral[0])
      }
      catch (e: any){
        console.log('Collateral Find Failure')
        console.log(e)
      }
    }
  }
  
  async function getUtxos(api: any) {
    if (wallets) {
      try{
      const _utxos = await api.getUtxos();
      var cborUtxos: any = [];
      for(var q in _utxos){
        cborUtxos.push(_utxos[q])
      }
      setCborUtxos(cborUtxos);
      const proc_utxo = await sendUtxos(cborUtxos);
      console.log('Available ADA only Wallet Utxos:',proc_utxo.adaOnlyUtxos);
      console.log('All Assets in Wallet:',proc_utxo.assetlist);
      setAssetUtxos(proc_utxo.assetlist);
      setUtxoObj(proc_utxo.adaOnlyUtxos);
      setNftObj(proc_utxo.nlist);
      }
      catch (e: any){
        console.log('Utxo Retrieval Failure')
      }
      setWalletDelay(false);
      //console.log(cborUtxos);
    }
  }
  
  async function getChangeAddress(api: any) {
    if (wallets) {
      setLoading(true);
      const _address = await api.getUsedAddresses();
      //console.log('HRM:',_address);
      setUsedAddresses(_address);
      setRawAddress(_address[0]);
      setLoading(false);
      //getHash(_address);
      setPk(_address[0].slice(2,58));
      console.log(_address[0].slice(2,58));
    }
  }
  
    async function signRawIn(rawtx:string) {
    if (wallets){ 
      console.log(rawtx)
      const signedTx = await currentWalletApi.signTx(rawtx);
      console.log("SignedSuccessfully");
      console.log(signedTx)
      return signedTx
      }
    }
    async function signRawOut(rawtx:string) {
      if (wallets){ 
        console.log(rawtx)
        const signedTx = await currentWalletApi.signTx(rawtx,true);
        console.log("Signed Successfuly");
        console.log(signedTx)
        return signedTx
        }
      }

    const CssTextField = styled(TextField)({
      '& label.Mui-focused': {color: 'green',},
      '& .MuiInput-underline:after': {borderBottomColor: 'green',},
      '& .MuiOutlinedInput-root': {color:'black',
      '& fieldset': {
          borderColor: 'black',
          fontSize: 16,
        },
        '&:hover fieldset': {
          borderColor: 'green',
        },
        '&.Mui-focused fieldset': {
          borderColor: 'green',
        },
      },
    });
    const CssFormControl = styled(FormControl)({
      '& label.Mui-focused': {color: 'green',},
      '& .MuiInput-underline:after': {borderBottomColor: 'green',},
      '& .MuiOutlinedInput-root': {color:'white',
      '& fieldset': {
          borderColor: 'white',
        },
        '&:hover fieldset': {
          borderColor: 'green',
        },
        '&.Mui-focused fieldset': {
          borderColor: 'green',
        },
      },
    });

    const offerValidate = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {      
      let o_regex = /^[0-9\b]+$/;
      let b_regex = /^[0-9\b]+$/;
      let a_regex = /^[0-9\b]+$/;

      if(bidAmountRequested.length == 0){b_regex = /^[1-9\b]+$/;}else{b_regex = /^[0-9\b]+$/;}
      if(offervalue.length == 0){o_regex = /^[1-9\b]+$/;}else{o_regex = /^[0-9\b]+$/;}  
      if(offerAssetAmount.length == 0){a_regex = /^[1-9\b]+$/;}else{a_regex = /^[0-9\b]+$/;}       
          if(e.currentTarget.id == "bidAmountReq"){
            if (b_regex.test(e.target.value) || e.target.value == "") {
            setBidAmountRequested(e.target.value);
            setInvalidOfferAlert(false);
            }
          }
          if(e.currentTarget.id == "offerValue") {
            if (o_regex.test(e.target.value) || e.target.value == "") {
            setOfferValue(e.target.value);
            setInvalidOfferAlert(false);
            }
          }
          if(e.currentTarget.id == "assetAmount"){
            if (a_regex.test(e.target.value) || e.target.value == "") {
            setOfferAssetAmount(e.target.value);
            setInvalidOfferAlert(false);
            }
          }        
     };

    const policyValidate = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (e.target.value.length  == 56 ) {
        setBidPolicy(e.target.value);
      }
      if (e.target.value.length  == 0){
        setBidPolicy(e.target.value);
        setBidImg('');
      }
    };

    const assetNameValidate = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setInvalidOfferAlert(false);
        setBidName(e.target.value);
        console.log('BidName', e.target.value)
        if (bidPolicy.length == 56 ) {
          getIPFS(bidPolicy.concat(e.target.value),false)
        }
        if(offerNftHexName == e.target.value ){
          setInvalidOfferAlert(true);  
        }
    };

    const searchValidate = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setSearchBox(e.target.value);
      searchFx(e.target.value);
  };

    const handleOfferNFT = (event: SelectChangeEvent) => {
      setOfferImg('')
      setOfferNftName(event.target.value as string);
      console.log('OfferNft Selector:',event.target.value)
      setInvalidOfferAlert(false); 
    {nftobj?.map(nft => {
      if(nft.assetname == event.target.value){
        setOfferNftObj(nft);
        setOfferNftHexName(nft.assethex);
        setOfferNftPolicy(nft.policy);
        getIPFS(nft.policy.concat(nft.assethex),true);
        if(bidName == nft.assethex ){
          setInvalidOfferAlert(true);  
        }
      }
      })} 
    };

    const handleTokenSelector = (event: SelectChangeEvent) => {
      setTokenSelectorVal(event.target.value as string);
      //setBidPolicy()
      //setBidName()
      console.log('Token Selector:',event.target.value)
    {tokenReg?.map(token => {
      if(token.currency == event.target.value){
        setBidPolicy(token.policy)
        setBidName(token.hexname)
      }
      })} 
    };

    useEffect(() => {
      getWalletsAsync();
   },[])
   

   const FLASK_URL: string = 'https://unicorn.your_application_domain.xyz'
   //const FLASK_AUTH = process.env.NEXT_PUBLIC_FLASK_AUTH
   const FLASK_AUTH = process.env.NEXT_PUBLIC_FLASK_AUTH
   let requestHeaders: any = { 'Content-Type': 'application/json', 'Auth': FLASK_AUTH };
   
   async function flaskOffer(hashin: any, netid: number, utxos: any,offerNftObj: any,offervalue: string,bidPolicy:string,bidName:string,bidAmountRequested: string,offerAssetAmount: string, usedAddresses: any,nftList: any,assetUtxos: any){
    //setLoading(true);
    
    setLoading(true);
    setMakeOfferDialog(false);
    setLoadingDialog(true);
    let buy_req = JSON.stringify({'rawaddress': hashin,'NetworkId': netid, 'utxoList': utxos, 'nftList':offerNftObj, 'offervalue': offervalue,'bidPolicy':bidPolicy,'bidName':bidName,'bidAmountReq': bidAmountRequested,'offerAssetAmount':offerAssetAmount,'usedAddresses': usedAddresses,'nList':nftobj,'assetUtxos': assetUtxos}) ;
    const buy_res = await fetch(FLASK_URL + '/flaskOffer', 
      {method: "POST", headers: requestHeaders, body: buy_req} )
    const cbor_to_sign: string = await buy_res.json();
    console.log(cbor_to_sign);

    try{
      let cbor_obj = JSON.parse(JSON.stringify(cbor_to_sign));
      if(cbor_obj.Cbor_to_sign == "BuildError"){
        setLoading(false);
        setAlertState(true);
        setSubmitDialog(true);
      }
      let signed_cbor = await signRawIn(cbor_obj.Cbor_to_sign);
      setSubmitDialog(true);
      let signed_cbor_req = JSON.stringify({'witness': signed_cbor,'tx_body_cbor': cbor_obj.Cbor_to_sign,'NetworkId': netid,'rawaddress': hashin}) ;
      ///---------------------------------------------------
      const sign_res = await fetch(FLASK_URL + '/flaskWitnessed', 
      {method: "POST", headers: requestHeaders, body: signed_cbor_req} )
      const tx_status: string = await sign_res.json()
      let tx_obj = JSON.parse(JSON.stringify(tx_status));
      if ('Error' in tx_obj){
          setAlertState(true);
      }
      else{
      setAlertState(false);
      console.log(tx_obj.txId);
      setTxId(tx_obj.txId);
      setTxsubmitstate(true); 
      setLoading(false);
      }
    }
    catch (e: any){
      setLoading(false);
      console.log(e)
      setAlertState(true);
    }
   setLoading(false);
   setLoadingDialog(false)
  }

  async function flaskFindScriptUtxos(hashin: any, netid: number, utxos: any,offerNftObj: any, escrow: any){
    //setLoading(true);
    setLoading(true);
    try{
      let find_req = JSON.stringify({'rawaddress': hashin,'NetworkId': netid, 'utxoList': utxos, 'nftList':nftobj, 'escrow': escrow}) ;
      const find_res = await fetch(FLASK_URL + '/flaskFindOffers', 
        {method: "POST", headers: requestHeaders, body: find_req} )
      const users_utxos: string = await find_res.json();
      const user_utxos_obj = JSON.parse(JSON.stringify(users_utxos))
      console.log(user_utxos_obj.script_utxos);
      if(escrow == 0){setOfferedUtxos(user_utxos_obj.script_utxos);
        setFilterOfferUtxos(user_utxos_obj.script_utxos);
      }
      else{
        setEscrowUtxos(user_utxos_obj.script_utxos)
      }

    }
    catch(e: any){
      setAlertState(true);
    }
    setLoading(false);
  }
////rawaddress,networkid,utxoobj
  const acceptOfferHandler = (e:any) => {
    let found = false
    let sum = 0
    {filterOfferUtxos?.map(offer => {
      if(offer.tx_hash == e.target.dataset.mssg){
        
        console.log(offer);        
        assetUtxos.assets.forEach( (asset: any) => {
          if(offer.unlock_name == asset.assethex && offer.unlock_policy == asset.policy){    
              sum = sum + Number(asset.amount)
          }
        });
        if(sum >= Number(offer.unlock_amount)){
          console.log('Need asset quantity: ',offer.unlock_amount, 'Your Asset Balance: ', sum)
          found = true
        }
        if (offer.unlock_name == '' && Number(balance) * (10 ** 6) > Number(offer.unlock_amount) ){
          found = true
        }
        if(found){
          flaskAcceptOffer(offer,rawaddress,networkid,utxoobj,usedAddresses,assetUtxos,collateralHex);
        }
        else{
          alert('You dont have enough of this asset to trade')
        }
      }
      })}
  };

  const cancelOrderHandler = (e:any) => {
    {escrowUtxos?.map(cancel => {
      if(cancel.tx_hash == e.target.dataset.mssg){
        console.log(cancel);
        flaskCancelOrder(cancel,rawaddress,networkid,utxoobj,usedAddresses,assetUtxos);
      }
      })}
  };

  async function flaskCancelOrder(offerUtxo:any,hashin: any, netid: number, utxos: any,usedAddresses: any,assetUtxos: any){
    //setLoading(true);
    setLoading(true);
    setEscrowDialog(false);
    setLoadingDialog(true)
    let find_req = JSON.stringify({'offerUtxo': offerUtxo,'rawaddress': hashin,'NetworkId': netid, 'utxoList': utxos,'usedAddresses': usedAddresses,'assetUtxos': assetUtxos}) ;
    const accept_res = await fetch(FLASK_URL + '/flaskCancelOrder', 
      {method: "POST", headers: requestHeaders, body: find_req} )
    const cbor_to_sign: string = await accept_res.json();
    console.log(cbor_to_sign);
    try{
      let cbor_obj = JSON.parse(JSON.stringify(cbor_to_sign));
      let signed_cbor = await signRawOut(cbor_obj.Cbor_to_sign);
      setEscrowDialog(false);
      setSubmitDialog(true);
      let signed_cbor_req = JSON.stringify({'witness': signed_cbor,'tx_body_cbor': cbor_obj.Cbor_to_sign,'NetworkId': netid,'rawaddress': hashin}) ;
      ///---------------------------------------------------
      const sign_res = await fetch(FLASK_URL + '/flaskWitnessed', 
      {method: "POST", headers: requestHeaders, body: signed_cbor_req} )
      const tx_status: string = await sign_res.json()
      let tx_obj = JSON.parse(JSON.stringify(tx_status));
      if ('Error' in tx_obj){
          setAlertState(true);
      }
      else{
      setAlertState(false);
      console.log(tx_obj.txId);
      setTxId(tx_obj.txId);
      setTxsubmitstate(true);
      setLoading(false);
      }
    }
    catch (e: any){
      setLoading(false);
      console.log('ErrorCatchHere')
      console.log(e)
      setAlertState(true);
    }
   setLoadingDialog(false)
   setLoading(false);
  }

  async function sendUtxos(cbor:any){
    //setLoading(true);
    setLoading(true);
    let cbor_req = JSON.stringify({'cbor': cbor}) ;
    const _res = await fetch(FLASK_URL + '/flaskProcessUtxos',{method: "POST", headers: requestHeaders, body: cbor_req} )
    const wallet_utxos: string = await _res.json();
    const res_object = JSON.parse(JSON.stringify(wallet_utxos))
    setLoading(false);
    return res_object
    //setNftObj(res_object.nlist);
     }
  
  async function flaskAcceptOffer(offerUtxo:any,hashin: any, netid: number, utxos: any,usedAddresses: any,assetUtxos: any,collateralHex: string){
    //setLoading(true);
    setLoading(true);
    setSeeOffersDialog(false);
    setLoadingDialog(true)
    let find_req = JSON.stringify({'offerUtxo': offerUtxo,'rawaddress': hashin,'NetworkId': netid, 'utxoList': utxos,'usedAddresses': usedAddresses,'assetUtxos': assetUtxos,'collateralHex': collateralHex}) ;
    const accept_res = await fetch(FLASK_URL + '/flaskAcceptOffer', 
      {method: "POST", headers: requestHeaders, body: find_req} )
    const cbor_to_sign: string = await accept_res.json();
    console.log(cbor_to_sign);
    try{

      let cbor_obj = JSON.parse(JSON.stringify(cbor_to_sign));
      let signed_cbor = await signRawOut(cbor_obj.Cbor_to_sign);
      
      
      let signed_cbor_req = JSON.stringify({'witness': signed_cbor,'tx_body_cbor': cbor_obj.Cbor_to_sign,'NetworkId': netid,'rawaddress': hashin}) ;
      ///---------------------------------------------------
      const sign_res = await fetch(FLASK_URL + '/flaskWitnessed', 
      {method: "POST", headers: requestHeaders, body: signed_cbor_req} )
      const tx_status: string = await sign_res.json()
      let tx_obj = JSON.parse(JSON.stringify(tx_status));
      if ('Error' in tx_obj){
          setAlertState(true);
      }
      else{
      console.log(tx_obj.txId);
      setLoadingDialog(false)
      setSubmitDialog(true);
      setTxId(tx_obj.txId);
      setTxsubmitstate(true);
      setLoading(false);
      }
    }
    catch (e: any){
      setLoading(false);
      console.log(e)
      setAlertState(true);
      setSeeOffersDialog(false);
      setSubmitDialog(true);
    }
   setLoading(false);
  }

  return (   
    <>
      <Head>
        <title>Nescrow</title>
        <meta name="description" content="Cardano Native Asset Escrow and Exchange" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/crow.ico" />
      </Head>
      
        <div className={styles.landing}>
          <div className={styles.cmain}>
           
            <Image src="/crow.svg" alt="Logo" width={80} height={80} priority/>
            
            <div className={styles.r1}>
              <button className={styles.button} onClick={aboutDHandler}>
                About
              </button>
              <button className={styles.button} disabled={walletdelay} onClick={makeOfferDHandler}>
                Make Offer
              </button>
              <button className={styles.button} disabled={walletdelay} onClick={seeEscrowDHandler}>
                In Escrow
              </button>
              <button className={styles.button} disabled={walletdelay} onClick={seeOffersDHandler}>
                See Offers
              </button>
              
              <button className= {styles.button}  onClick={onConnectWalletShow}>
              {(walletconnected == false) && <> Connect&#x24;<AccountBalanceWalletRoundedIcon/> </> }
              {(walletconnected && currentWallet != undefined) && <> {balance}₳ &nbsp;<Avatar src={currentWallet.icon} /> </> }
              </button>

            </div>
          </div>
        </div>

        {/*Wallet Connector/Selector Popup Dialog*/}
      <Dialog
        open={showConnectWallet}
        onClose={() => setShowConnectWallet(false)}>
        <DialogTitle id="alert-dialog-title" color={"black"}>
          {"Select your wallet"}
        </DialogTitle>
        <DialogContent className="w-[480px] text-white">
          {(wallets === undefined || wallets?.length <= 0) && <>No wallets found</>}
          <List>
            {wallets?.map(wallet =>
              <div key={wallet.id}>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => onConnectWallet(wallet)}>
                    <ListItemIcon>
                      <Avatar src={wallet.icon} />
                    </ListItemIcon>
                    <ListItemText className="text-white" primary={wallet.name.toUpperCase()} />
                  </ListItemButton>
                </ListItem>
              </div>
            )}
          </List>
        </DialogContent>
      </Dialog>
      {/*BalanceDialog*/}
      <Dialog
        open={balancedialog}
        onClose={() => setBalancedialog(false)}>
        <DialogTitle id="alert-dialog-title" color={"black"}>
          {"Wallet Information"} 
        </DialogTitle>
        <DialogContent className="w-[480px] text-blue">
            {/* {(balance < TICKET_COST) && <><h2>{balance}₳ is an insufficient balance to buy a ticket &#128532; </h2> </>} */}
            {/*{(utxonum < 2) && <> */}
             <h2> You dont have a utxo with 5₳ order more to use as Collateral</h2>
             {/* </>} */}
        </DialogContent>
      </Dialog>
      {/*MakeOfferDialog*/}
      <Dialog 
        open={makeofferdialog}
        onClose={() => setMakeOfferDialog(false)}>
        <DialogTitle id="alert-dialog-title" color={"black"} >
          {"Make Offer"} 
        </DialogTitle>
        
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={1}>
          <FormControl component="fieldset" sx={{width: 500}}>
            <FormGroup aria-label="position" row>
              <FormControlLabel
                value="top"
                control={<Switch checked={offerswitch} onChange={offerToggleFx} color="primary" />}
                label={`${offerswitch? '$ADA':'Native Asset'}`}
                labelPlacement="end"/>
            </FormGroup>
          </FormControl>

          {offerswitch && <TextField id="offerValue" variant="outlined" type="text" placeholder={placeholder} value={offervalue}
            onChange={e => offerValidate(e)}  /> }
          
          {!offerswitch && <TextField id="assetAmount" variant="outlined" type="text" placeholder="Enter Amount..." value={offerAssetAmount}
            onChange={e => offerValidate(e)}  /> }
                  
          {(offerswitch != true && walletconnected) && 
            <FormControl color="secondary" sx={{width: 500}}>   
              <InputLabel focused={false} id="test-select-label" ></InputLabel>
                <Select id="nftselector"
                  labelId="test-select-label"
                  value={offerNftName}
                  onChange={handleOfferNFT}>
                  {nftobj?.map(function(nft,list) {
                    return <MenuItem sx={{ fontSize: 16}} key={list} value={nft.assetname}>{nft.assetname}</MenuItem>
                      })} 
                </Select>
            </FormControl>} 

            {(!offerswitch && offerNftHexName != '') && <Typography variant="caption"> Policy: {offerNftPolicy} 
            <br></br> Name: {offerNftHexName}
            </Typography>}
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200" paddingTop="20">
              {(offerimg[0] == 'h') && 
                <Card variant="outlined" sx={{ maxWidth: 200, maxHeight: 200}}> 
                  <img src={offerimg} height={200} width={200} alt='ipfsImg'></img>
                </Card>}
            </Box>
            
            <Typography variant="subtitle1" >Request Asset or NFT</Typography>
            
            <FormControl component="fieldset" sx={{width: 500}}>
            <FormGroup aria-label="position" row>
              <FormControlLabel
                value="top"
                control={<Switch checked={bidSwitch} onChange={bidToggleFx} color="primary" />}
                label={`${bidSwitch? '$ADA':'Native Asset'}`}
                labelPlacement="end"/>
            </FormGroup>
          </FormControl>

          {(bidSwitch != true && walletconnected) && <>
            <FormControl  sx={{ m: 1, minWidth: 150 }}>   
              <InputLabel variant="outlined" focused={false} id="token_select_input_label" >Assets</InputLabel>
                <Select id="token_select"
                  MenuProps={{ PaperProps: { sx: { maxHeight: 220 } } }}
                  labelId="token_select_label"
                  value={tokenSelectorVal}
                  onChange={handleTokenSelector}
                  input={<OutlinedInput label="Assets" />}>
                      {tokenReg?.map(function(token,list) {
                    return <MenuItem sx={{ fontSize: 16}}  key={list} value={token.currency}>  <ListItemIcon> <ListItemText>{token.currency} &nbsp; </ListItemText> <Avatar alt={token.currency} src={token.img}/></ListItemIcon>  </MenuItem>
                      })} 
                </Select>
            </FormControl>

            <TextField id="bidPolicyTextField" sx={{'.MuiInputBase-input': { fontSize: 14 },}} variant="outlined" label="Policy" type="text"  placeholder="Paste PolicyId here" value={bidPolicy}
            onChange={e => policyValidate(e)} autoFocus />
          
            <TextField id="bidNameTextField" sx={{'.MuiInputBase-input': { fontSize: 14 },}} variant="outlined" label="Hex Name" type="text" placeholder="Paste HEX asset Name here" value={bidName}
            onChange={e => assetNameValidate(e)} autoFocus /> 
            </>}
            
                    

            <TextField id="bidAmountReq" variant="outlined" type="text" label="Amount" placeholder="Enter Amount..." value={bidAmountRequested}
            onChange={e => offerValidate(e)} /> 

            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200" paddingTop="20">
            {loading && <CircularProgress color="success" /> }   
              {(bidimg[0] == 'h' && ipfsReqStat == true && ipfsError == false) && 
                <Card variant="outlined" sx={{ maxWidth: 200, maxHeight: 200}}> 
                  <img src={bidimg} height={200} width={200} alt='ipfsImg'></img>
                </Card>}
            </Box>
            {invalidOfferAlert && <Alert severity="info">Cannot offer and Request the Same NFT</Alert>  }
            {(ipfsError && bidAmountRequested == '1') && <Alert severity="info">Unable to retrieve IPFS image - Check Asset Details</Alert>  }
            {(Number(offervalue) > balance) && <Alert severity="error">Offer &gt; wallet balance</Alert> }
            <Button variant="contained"  disabled={((offerNftName == '' && offervalue == '') || (!offerswitch && offerAssetAmount =='') || (offerswitch && bidSwitch ) || (bidSwitch == false && (bidName == '' || bidPolicy == '' )) || bidAmountRequested == '' || Number(offervalue) > balance || invalidOfferAlert )} onClick={() => flaskOffer(rawaddress,networkid,utxoobj,offerNftObj,offervalue,bidPolicy,bidName,bidAmountRequested,offerAssetAmount,usedAddresses,nftobj,assetUtxos)}>
            Submit Escrow
            </Button>
                 
          </Box>              
        </DialogContent>
      </Dialog>
      {/*AboutDialog*/}
      <Dialog
        open={aboutdialog}
        onClose={() => setAboutDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title" color={"black"}>
          {"Information"} 
        </DialogTitle>
        <DialogContent className="w-[480px] text-blue">
          <p> Nescrow is a permissionless smart-contract marketplace on the Cardano Blockchain. You can use Nescrow to swap any Cardano native asset or NFT for any other Cardano asset or NFT. </p>
          <br></br>
          <p> If you are having trouble submitting orders please ensure you have the right amount of ADA or tokens to fulfill the order, the fee, and to provide collateral for the contract. If wallet trouble persists we encourage you to try a different wallet with fewer UTXOs for the best user experience. You can also try cleaning your wallet using <Link target="_blank" rel='noopener' variant="caption" href={`https://unfrack.it/`}>https://unfrack.it/</Link> </p>
          <br></br>
          <p> Ensure you review all orders before you accept them - smart contract transactions are irreversible. As with any transaction you should <b>always</b> check the asset quantities displayed by your wallet before signing any transactions.</p>
          <br></br>
          <p> <b>Please Note:</b> Only assets present in the request Assets drop-down menu have proper decimal support</p>
          <br></br>
          <p>Nescrow is provided under an MIT software licence - users agree to these <Link target="_blank" rel='noopener' variant="caption" href={`https://github.com/while0x1/Nescrow-Catalyst/blob/main/LICENSE`}> terms </Link> </p>
          <br></br>
          <p><b>Happy Trading!</b></p>
        </DialogContent>
      </Dialog>

      {/*NetworkDialog*/}
      <Dialog
        open={networkdialog}
        onClose={() => setNetworkdialog(false)}>
        <DialogTitle id="alert-dialog-title" color={"black"}>
          {"Wallet Information"} 
        </DialogTitle>
        <DialogContent className="w-[480px] text-blue">
          <h2> This app is for the Mainnet Cardano Network </h2>
          <p><b>Please change networks</b></p>
        </DialogContent>
      </Dialog>
      <Dialog
        open={submitDialog}
        onClose={() => setSubmitDialog(false)}>
        <DialogTitle id="alert-dialog-title" color={"black"}>
          {"Transaction Status"} 
        </DialogTitle>
        <DialogContent className="w-[480px] text-blue">
                      
          {loading && 
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400" paddingTop="20">
            <CircularProgress color="success" />   
            </Box>
          }

        {alertstate && <Alert variant="filled" severity="warning" onClose={() => {setAlertState(false);setTxId('Error')}}>Processing Error &#128532;</Alert>}

        {(txId != "Error" && !alertstate) && <> Success ! &#129395; <br></br> <br></br> 
          <Link target="_blank" rel='noopener' variant="caption" href={`https://cexplorer.io/tx/${txId}`}>{txId}</Link>
        </>}
        {(txId === "Error") && <> Transaction Failed &#128532; </>}    
        </DialogContent>
      </Dialog>

      {/*See Offers*/}
      <Dialog
        open={seeoffersdialog}
        onClose={() => setSeeOffersDialog(false)}>
        <DialogTitle id="alert-dialog-title">Open Offers</DialogTitle>
        <DialogContent className="w-[480px] text-blue" sx={{gap: 20}}>
        
          <Box  display="flex" justifyContent="center" alignItems="center" flexDirection="column" gap={2} width="345" minHeight="400">
          
          {loading && <Box display="flex" justifyContent="center" alignItems="center" minHeight="400" paddingTop="20"><CircularProgress color="success" /> </Box> }
          {(filterOfferUtxos != undefined && filterOfferUtxos.length == 0 && !loading) && <Typography gutterBottom variant="h5" component="div"> No Offers Found </Typography>}
          {(Array.isArray(filterOfferUtxos) && !loading) &&
          <Box sx={{ width: 200 }}>
          <Typography gutterBottom>Search</Typography>
          
          {/* 
          <Slider  onChange ={handleSlide} value={sliderVal} marks={customMarks} step={1} max={2} min={0} valueLabelDisplay="off"/>
            */}
          
          <TextField
            id="searchBox" variant="outlined" type="text" placeholder='asset name' value={searchBox}
            onChange={e => searchValidate(e)}>
          </TextField>
          </Box>
          }
          {alertstate && <Alert variant="filled" severity="warning" onClose={() => {setAlertState(false);}}>Processing Error &#128532;</Alert>}
         {(Array.isArray(filterOfferUtxos)) && <> 
          {filterOfferUtxos?.map(function(datum,list) {
                                
                      return    <div key={list}>
                                  <Card sx={{ maxWidth: 345 }}>
                                    <CardContent>
                                    <Typography gutterBottom variant="h5" component="div">
                                        Escrow Offer
                                    </Typography>

                                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="250"  gap={2}>
                                      {(datum.offer_img != '' && datum.offer_img != 'Error' && datum.lockedAssetAmount == '1' ) && <img src={datum.offer_img} height={200} width={200} alt='ipfsImg'></img> }
                                      {(datum.offer_img == '' && datum.nft_offer_policy == '' ) && <Typography variant="h2" color="text.primary">{datum.lovelace}₳ </Typography>}
                                      {(datum.offer_img == '' && datum.nft_offer_policy != '' && Number(datum.lockedAssetAmount) == 1 ) && <Alert severity="info">Image Not Available</Alert>}
                                      
                                    
                                      {tokenReg?.map(function(token,list) {
                                        if(datum.nft_offer_policy == token.policy && datum.nft_offer_hexname == token.hexname){
                                          return <div key={list}>
                                                  <Box display="flex" flexDirection="column" width={320} justifyContent="center" alignItems="center">
                                                      <Typography variant="h4" color="text.primary">{Number(datum.lockedAssetAmount) / (10 ** Number(datum.locked_decimals))} {token.currency} &nbsp; </Typography>
                                                  <Avatar sx={{ width: 50, height: 50 }} alt={token.currency} src={token.img}/>
                                                  <Typography><br></br></Typography>
                                                  </Box>
                                                  </div>
                                        }
                                        else{
                                          {(datum.lockedAssetAmount != '1') && 
                                          
                                          <Typography variant="h1" color="text.primary">{Number(datum.lockedAssetAmount) / (10 ** Number(datum.locked_decimals))} </Typography>
                                          }
                                        }
                                      })} 
                                    </Box>
                                    
                                    {(datum.nft_offer_policy != '' && datum.unlock_name != '') && 
                                        <Box display="flex" width={320} >
                                        <Typography variant="body2" color="text.secondary">
                                            <br></br>
                                            Swap {Number(datum.unlock_amount) / (10 ** Number(datum.unlock_decimals))} {datum.unlock_name_utf} for {Number(datum.lockedAssetAmount) / (10 ** Number(datum.locked_decimals))} {datum.nft_offer_name}
                                        </Typography> 
                                        </Box>}
                                        {(datum.nft_offer_policy != '' && datum.unlock_name == "") && 
                                        <Box display="flex" width={320} >
                                        <Typography variant="body2" color="text.secondary">
                                            <br></br>
                                            Swap {Number(datum.unlock_amount)/1000000}₳ {datum.unlock_name_utf} for {Number(datum.lockedAssetAmount) / (10 ** Number(datum.locked_decimals))} {datum.nft_offer_name}
                                        </Typography> 
                                        </Box>}
                                    
                                        {(datum.nft_offer_policy == '') && 
                                        <Box display="flex" width={320} >
                                        <Typography variant="body2" color="text.secondary">
                                            <br></br>
                                            Swap {Number(datum.unlock_amount) / (10 ** Number(datum.unlock_decimals))} {datum.unlock_name_utf} for {datum.lovelace}₳
                                        </Typography>
                                        </Box>
                                        }
                                  

                                    </CardContent>
                                    <CardActions>
                                      <Box display="flex" flexDirection="row" gap={1}>
                                      <Button size="small" data-mssg={datum.tx_hash} onClick={acceptOfferHandler} variant="outlined">Accept </Button>
                        
                                      <Link href={('https://cexplorer.io/tx/'.concat(datum.tx_hash))} target="_blank" rel="noopener"> <Button size="small"  variant="outlined"  >View</Button></Link>
                                      {/*<Link variant="caption" href={`https://cexplorer.io/tx/${txId}`}>{txId}</Link>*/}
                                      </Box>
                                      {/* {(networkid == 0) && <Button size="small" href={('https://preprod.cexplorer.io/tx/'.concat(datum.tx_hash))} variant="outlined"  >View</Button>} */}
                                    </CardActions>
                                    </Card>
                                </div> })}
          </>}
          </Box>
        </DialogContent>
      </Dialog>

    {/*InEscrowDialog*/}
    <Dialog
        open={escrowdialog}
        onClose={() => setEscrowDialog(false)}>
        <DialogTitle id="alert-dialog-title" color={"black"}>Assets in Escrow</DialogTitle>
        <DialogContent className="w-[480px] text-blue" sx={{gap: 20}}>
          <Box  display="flex" justifyContent="center" alignItems="center" flexDirection="column" gap={2} width="345">
          {(escrowUtxos != undefined && escrowUtxos.length == 0 && !loading) && <Typography gutterBottom variant="h5" component="div"> No Escrow Bids Found </Typography>}
          {loading && <Box display="flex" justifyContent="center" alignItems="center" minHeight="400" paddingTop="20"><CircularProgress color="success" /> 
          </Box> }
        {(Array.isArray(escrowUtxos)) && <>
         {escrowUtxos?.map(function(datum,list) {
                    return    <div key={list}>
                                <Card sx={{ maxWidth: 345 }}>
                                  <CardContent>
                                  <Typography gutterBottom variant="h5" component="div">
                                      Escrow Bid
                                  </Typography>

                                  <Box display="flex" justifyContent="center" alignItems="center" minHeight="250" paddingTop="20">
                                  {(datum.offer_img != '' && datum.offer_img != 'Error' && datum.lockedAssetAmount == '1'  ) && <img src={datum.offer_img} height={200} width={200} alt='ipfsImg'></img> }
                                  {(datum.offer_img == '' && datum.nft_offer_policy == '' ) && <Typography variant="h2" color="text.primary">{datum.lovelace}₳ </Typography>}
                                  {(datum.offer_img == '' && datum.nft_offer_policy != '' && datum.lockedAssetAmount == '1' ) && <Alert severity="info">Image Not Available</Alert>}
         
                                  {tokenReg?.map(function(token,list) {
                                    if(datum.nft_offer_policy == token.policy && datum.nft_offer_hexname == token.hexname){
                                      return <div key={list}>
                                      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center">
                                        <Typography variant="h5" color="text.primary">{Number(datum.lockedAssetAmount) / (10 ** Number(datum.locked_decimals))} {token.currency} &nbsp; </Typography>
                                        <Avatar sx={{ width: 50, height: 50 }} alt={token.currency} src={token.img}/>
                                      </Box> </div>

                                    }
                                  })} 
                                
                                  </Box>

                                      {(datum.nft_offer_policy != '' && datum.unlock_name != '') && 
                                      <Box display="flex" width={320} >
                                      <Typography variant="body2" color="text.secondary">
                                          <br></br>
                                         {Number(datum.lockedAssetAmount) / (10 ** Number(datum.locked_decimals))} {datum.nft_offer_name} is in escrow as an offer for {Number(datum.unlock_amount) / (10 ** Number(datum.unlock_decimals))} {datum.unlock_name_utf} 
                                      </Typography></Box>}

                                      {(datum.nft_offer_policy != '' && datum.unlock_name == '') && 
                                      <Box display="flex" width={320} >
                                      <Typography variant="body2" color="text.secondary">
                                          <br></br>
                                         {Number(datum.lockedAssetAmount) / (10 ** Number(datum.locked_decimals))} {datum.nft_offer_name} is in escrow as an offer for {Number(datum.unlock_amount)/1000000}₳ 
                                      </Typography></Box>}

                                      {(datum.nft_offer_policy == '') && 
                                      <Box display="flex" width={320} >
                                      <Typography variant="body2" color="text.secondary">
                                          <br></br>
                                         {datum.lovelace}₳ is in escrow as an offer for {Number(datum.unlock_amount) / (10 ** Number(datum.unlock_decimals))} {datum.unlock_name_utf} 
                                      </Typography></Box>}

                                  </CardContent>
                                  <CardActions>
                                    <Box display="flex" flexDirection="row" gap={1}>
                                      <Button size="small"  data-mssg={datum.tx_hash} onClick={cancelOrderHandler} variant="outlined">Cancel</Button>
                                      {(networkid == 1) && <Link href={('https://cexplorer.io/tx/'.concat(datum.tx_hash))} target="_blank" rel="noopener"> <Button size="small"  variant="outlined"  >View</Button></Link>}
                                    
                                      {(networkid == 0) && <Button size="small" href={('https://preprod.cexplorer.io/tx/'.concat(datum.tx_hash))} variant="outlined"  >View</Button>}
                                    
                                    </Box>
                                  </CardActions>
                                  </Card>
                              </div> })}
          </>}
          </Box>
        </DialogContent>
      </Dialog>
      {/*LoadingDialog*/}
      <Dialog
        open={loadingdialog}
        onClose={() => setLoadingDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title" color={"black"}>
          {"Processing Order"} 
        </DialogTitle>
        <DialogContent className="w-[480px] text-blue">
                      
          {loading && 
            <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" minHeight="400" gap={1} paddingTop="20">
              <DialogContentText> Please wait while we process your order ...</DialogContentText>
            <CircularProgress color="success" />   
            </Box>
          }
        </DialogContent>
      </Dialog>

    </>
  )
}
