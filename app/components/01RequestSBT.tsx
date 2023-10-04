'use client';

import { useState } from 'react';
import { Wallet, ethers } from "ethers";
import { Button, Form, Message } from 'semantic-ui-react';
import { CHAIN_NAMESPACES, SafeEventEmitterProvider } from "@web3auth/base";
import { Web3Auth } from "@web3auth/modal";

export default function RequestSBT (props: any) {
  const [idToken, setIdToken] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [address, setAddress] = useState('');

  const login = async () => {
    const web3auth = new Web3Auth({
      clientId: process.env.WEB3_AUTH_CLIENT_ID || "BFsKtGfr5armoE_s_Vig-wzBeonn0DSsfO2w-qDdKV1T3Ac6tSuZovgKx0nnwMj4hdOc_38POMFqXVcT6e0n1lo",
      // testnet: BB9-HFtHLnNBeMZhxvALkBrMqwJjuSZNTiE2gd9mwnUzrmqLGKXER07oE3WTcZkjlE4ZKw6lxEoE-Rx6QfoihI4
      web3AuthNetwork: "sapphire_mainnet",
      chainConfig: {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: "0x5",
        rpcTarget: "https://rpc.ankr.com/eth_goerli",
        displayName: "Goerli",
        blockExplorer: "https://goerli.etherscan.io",
        ticker: "ETH",
        tickerName: "Ethereum"
      },
    });

    await web3auth.initModal();

    if (!web3auth) {
      throw new Error("web3auth not initialized yet");
    }
    const web3authProvider = await web3auth.connect();
    if (!web3authProvider) {
      throw new Error("web3authprovider not initialized yet");
    }

    if (!web3auth.provider) {
      throw new Error("web3authprovider not initialized yet");
    }
    const authenticateUser = await web3auth.authenticateUser();

    const pKey = await getPrivateKey(web3auth.provider);
    setIdToken(authenticateUser.idToken);
    setPrivateKey("0x"+pKey);

    const wallet: Wallet = new ethers.Wallet(
      "0x"+pKey,
      ethers.getDefaultProvider("goerli")
      );
    setPublicKey(wallet.publicKey);
    setAddress(wallet.address);
  };

  const generatePrivateKey = () => {
    const pKey = ethers.Wallet.createRandom().privateKey;
    const wallet: Wallet = new ethers.Wallet(
      pKey,
      ethers.getDefaultProvider("goerli")
      );
    
    setIdToken("");
    setPrivateKey(pKey);
    setPublicKey(wallet.publicKey);
    setAddress(wallet.address);
  };

  const getPrivateKey = async (provider: SafeEventEmitterProvider) => {
    return (await provider.request({
      method: "private_key",
    })) as string;
  };

  const requestSBT = () => {
    props.setPrivateKey(privateKey);
    props.setPublicKey(publicKey);
    props.setAddress(address);
  }

  return (
    <div id="requestsbt" style={{ marginBottom: "20px"}}>
      <Message
        attached
        icon='user'
        color='green'
        header='Login, get private key & request SBT'
        content='Identity holder'
      />
      <Form className='attached fluid segment'>
        <Button color='blue' onClick={login}>Login</Button>
        <Button color='blue' onClick={generatePrivateKey}>Generate Random Private Key</Button>
        <Form.Input label='Id token' type='text' value={idToken} readOnly error/>
        <Form.Input label='Private key' type='text' value={privateKey} readOnly error/>
        <Form.Input label='Public key' type='text' value={publicKey} readOnly error/>
        <Form.Input label='Address' type='text' value={address} readOnly error/>
        <Button color='blue' onClick={requestSBT}>Request SBT</Button>
      </Form>
    </div>
  );
};
