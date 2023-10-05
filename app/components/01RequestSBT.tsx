'use client';

import { useState } from 'react';
import { Wallet, ethers } from "ethers";
import { Button, Form, Message } from 'semantic-ui-react';
import { CHAIN_NAMESPACES, SafeEventEmitterProvider } from "@web3auth/base";
import { Web3Auth } from "@web3auth/modal";
import { Presets } from "userop";

export default function RequestSBT (props: any) {
  const [
    web3authIdentityHolder,
    setWeb3authIdentityHolder
  ] = useState<Web3Auth | null>(null);
  const [account, setAccount] = useState<Presets.Builder.SimpleAccount | null>(
    null
  );
  const [idToken, setIdToken] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [address, setAddress] = useState('');

  const entryPoint = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
  const simpleAccountFactory = "0x9406Cc6185a346906296840746125a0E44976454";
  const pmUrl = "https://api.stackup.sh/v1/paymaster/6b69276c7a5b5fd1d459f7553ee9645a32a15a01e097d8baffd102447bbf3870";
  const pmContext = {
    type: "payg",
  };

  const login = async () => {
    const web3auth = new Web3Auth({
      clientId: process.env.WEB3_AUTH_CLIENT_ID || "BFsKtGfr5armoE_s_Vig-wzBeonn0DSsfO2w-qDdKV1T3Ac6tSuZovgKx0nnwMj4hdOc_38POMFqXVcT6e0n1lo",
      // testnet: BB9-HFtHLnNBeMZhxvALkBrMqwJjuSZNTiE2gd9mwnUzrmqLGKXER07oE3WTcZkjlE4ZKw6lxEoE-Rx6QfoihI4
      web3AuthNetwork: "testnet",
      chainConfig: {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: "0x5",
        rpcTarget: "https://api.stackup.sh/v1/node/6b69276c7a5b5fd1d459f7553ee9645a32a15a01e097d8baffd102447bbf3870"
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

    setWeb3authIdentityHolder(web3auth);

    const pKey = await getPrivateKey(web3auth.provider);
    const acc = await createAccount(pKey);
    setIdToken(authenticateUser.idToken);
    setAccount(acc);
    setPrivateKey("0x"+pKey);

    const wallet: Wallet = new ethers.Wallet(
      "0x"+pKey,
      ethers.getDefaultProvider("goerli")
      );
    setPublicKey(wallet.publicKey);
    setAddress(acc.getSender());
  };

  const logout = async () => {
    if (!web3authIdentityHolder) {
      throw new Error("web3auth not initialized yet");
    }
    await web3authIdentityHolder.logout();
    setIdToken('');
    setAccount(null);
    setPrivateKey('');
    setPublicKey('');
    setAddress('');
  };

  const createAccount = async (privateKey: string) => {
    const paymaster = Presets.Middleware.verifyingPaymaster(pmUrl, pmContext)
    return await Presets.Builder.SimpleAccount.init(
      new Wallet(privateKey) as any,
      "https://api.stackup.sh/v1/node/6b69276c7a5b5fd1d459f7553ee9645a32a15a01e097d8baffd102447bbf3870",
      entryPoint,
      simpleAccountFactory,
      paymaster
    );
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
        <Button color='blue' onClick={logout}>Logout</Button>
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
