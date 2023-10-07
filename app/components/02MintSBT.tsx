import { useEffect, useState } from 'react';
import { Wallet, ethers } from "ethers";
import { Button, Form, Message } from 'semantic-ui-react';
import { CHAIN_NAMESPACES, SafeEventEmitterProvider } from "@web3auth/base";
import { Web3Auth } from "@web3auth/modal";
import { Client, Presets } from "userop";
import zkSBTAddress from "@/utils/ZKSBT.json";
import { getTokenIdFromMintTransaction, mintBuilder } from '@/utils/web3';

const { encryptWithPublicKey } = require("../../utils/crypto");
const buildPoseidon = require("circomlibjs").buildPoseidon;

export default function MintSBT (props: any) {
  const [
    web3auth,
    setWeb3auth
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

  const [minting, setMinting] = useState(false);
  const [creditScore, setCreditScore] = useState('');
  const [income, setIncome] = useState('');
  const [reportDate, setReportDate] = useState('');
  const [root, setRoot] = useState('');
  const [encryptedCreditScore, setEncryptedCreditScore] = useState({
    iv: '',
    ephemPublicKey: '',
    ciphertext: '',
    mac: ''
  });
  const [encryptedIncome, setEncryptedIncome] = useState({
    iv: '',
    ephemPublicKey: '',
    ciphertext: '',
    mac: ''
  });
  const [encryptedReportDate, setEncryptedReportDate] = useState({
    iv: '',
    ephemPublicKey: '',
    ciphertext: '',
    mac: ''
  });
  const [sbtAddress, setSbtAddress] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [events, setEvents] = useState<string[]>([]);

  const checkOdd = (n: string) => {
    if (n.length % 2 == 0) {
      return n;
    } else {
      return "0" + n;
    }
  }

  const encrypt = async () => {
    // middleware calculates root of the Merkle Tree's data
    const poseidon = await buildPoseidon();
    const root = poseidon([
      BigInt(props.address),
      BigInt(creditScore),
      BigInt(income),
      BigInt(new Date(reportDate).getTime())
    ]);
    setRoot("0x" + checkOdd(BigInt(poseidon.F.toString(root)).toString(16)));

    // middleware encrypts data with public key of address1
    const eCreditScore = await encryptWithPublicKey(
      props.publicKey.replace("0x", ""),
      creditScore
    );
    const eIncome = await encryptWithPublicKey(
      props.publicKey.replace("0x", ""),
      income
    );
    const eReportDate = await encryptWithPublicKey(
      props.publicKey.replace("0x", ""),
      (new Date(reportDate).getTime()).toString()
    );

    setEncryptedCreditScore(eCreditScore);
    setEncryptedIncome(eIncome);
    setEncryptedReportDate(eReportDate);
  }

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

    setWeb3auth(web3auth);

    const pKey = await getPrivateKey(web3auth.provider);
    const acc = await createAccount(pKey);
    setIdToken(authenticateUser.idToken);
    setAccount(acc);
    setPrivateKey("0x"+pKey);

    const wallet: Wallet = new ethers.Wallet(
      "0x"+pKey,
      ethers.getDefaultProvider("goerli")
      );
    setPublicKey(wallet.signingKey.publicKey);
    setAddress(acc.getSender());
  };

  const logout = async () => {
    if (!web3auth) {
      throw new Error("web3auth not initialized yet");
    }
    await web3auth.logout();
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

  const getPrivateKey = async (provider: SafeEventEmitterProvider) => {
    return (await provider.request({
      method: "private_key",
    })) as string;
  };

  const mint = async () => {
    setMinting(true);
    setEvents([]);
    try {
      if (!account) {
        throw new Error("Account not initialized");
      }
      addEvent("Sending transaction...");

      const client = await Client.init(
        "https://api.stackup.sh/v1/node/6b69276c7a5b5fd1d459f7553ee9645a32a15a01e097d8baffd102447bbf3870",
        entryPoint
      );

      const builder = mintBuilder(
        account,
        props.address,
        root,
        encryptedCreditScore,
        encryptedIncome,
        encryptedReportDate
      );

      const res = await client.sendUserOperation(
        builder,
        {
          onBuild: async (op) => {
            addEvent(`Signed UserOperation: `);
            addEvent(JSON.stringify(op, null, 2) as any);
          },
        }
      );
      addEvent(`UserOpHash: ${res.userOpHash}`);

      addEvent("Waiting for transaction...");
      const ev = await res.wait();
      addEvent(`Transaction hash: ${ev?.transactionHash ?? null}`);

      if (ev?.transactionHash) {
        const transactionHash = ev?.transactionHash;
        const tokenId = await getTokenIdFromMintTransaction(transactionHash);

        setTokenId(tokenId);
        props.setTokenId(tokenId);
      }
      /*
      
      const mintTx = await zksbt
      .mint(
        props.address,
        root,
        encryptedCreditScore,
        encryptedIncome,
        encryptedReportDate
      );

      const mintReceipt = await mintTx.wait();
      const tokenId = mintReceipt.events![0].args![1].toNumber();

      setTokenId(tokenId);
      props.setTokenId(tokenId); */
    } catch (error) {
      addEvent(String(error));
    }
    setMinting(false);
  }

  useEffect(() => {
    setSbtAddress(zkSBTAddress.address);
  });

  const addEvent = (newEvent: string) => {
    setEvents((prevEvents) => [...prevEvents, newEvent]);
  };

  return (
    <div id="mintsbt" style={{ marginBottom: "20px"}}>
      <Message
        attached
        icon='university'
        color='yellow'
        header='Encrypt data & Mint SBT'
        content='Authority'
      />
      <Form className='attached fluid segment'>
        <Form.Input label='Public key' type='text' value={props.publicKey} readOnly error/>
        <Form.Input label='Address' type='text' value={props.address} readOnly error/>
        <Form.Input label='Credit score' type='number' value={creditScore} 
          onChange={(e) => setCreditScore(e.target.value)}/>
        <Form.Input label='Income' type='number' value={income} 
          onChange={(e) => setIncome(e.target.value)}/>
        <Form.Input label='Report date' type='date' value={reportDate} 
          onChange={(e) => setReportDate(e.target.value)}/>

        <Button color='blue' onClick={encrypt}>Encrypt data</Button>

        <Form.Input label='Merkle tree root (address/creditScore/income/reportDate)'
          type='text' value={root} readOnly error/>
        <Form.Input label='Encrypted data (with publicKey)'
          type='text'
          value={encryptedCreditScore.ciphertext?'['+JSON.stringify(encryptedCreditScore)+', '+JSON.stringify(encryptedIncome)+', '+JSON.stringify(encryptedReportDate)+']':''}
          readOnly error/>
        <Form.Input label='SBT smart contract address' type='text' value={sbtAddress} readOnly error/>

        <Button color='blue' onClick={login}>Login</Button>
        <Button color='blue' onClick={logout}>Logout</Button>
        
        <Form.Input label='Social login Id token' type='text' value={idToken} readOnly error/>
        <Form.Input label='Private key' type='text' value={privateKey} readOnly error/>
        <Form.Input label='Public key' type='text' value={publicKey} readOnly error/>
        <Form.Input label='Address' type='text' value={address} readOnly error/>

        <Button color='blue' onClick={mint} disabled={account==null}loading={minting}>
          Mint SBT to {props.address}</Button>

        <Form.Field control='textarea' rows='10' label='Minting process' value={events.join(`\n`)} readOnly error/>
        <Form.Input label='SBT Token ID' type='text' value={tokenId} readOnly error/>
      </Form>
    </div>
  );
};
