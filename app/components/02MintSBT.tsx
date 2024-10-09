import { useEffect, useState } from 'react';
import { Button, Form, Message } from 'semantic-ui-react';
import zkSBTAddress from "@/utils/ZKSBT.json";
import zksbt from '@/utils/web3';

const { encryptWithPublicKey } = require("../../utils/crypto");
const buildPoseidon = require("circomlibjs").buildPoseidon;

export default function MintSBT (props: any) {
  const [error, setError] = useState('');

  const [minting, setMinting] = useState(false);
  const [creditScore, setCreditScore] = useState('');
  const [income, setIncome] = useState('');
  const [reportDate, setReportDate] = useState('');
  const [root, setRoot] = useState('');
  const [encryptedCreditScore, setEncryptedCreditScore] = useState('');
  const [encryptedIncome, setEncryptedIncome] = useState('');
  const [encryptedReportDate, setEncryptedReportDate] = useState('');
  const [sbtAddress, setSbtAddress] = useState('');
  const [tokenId, setTokenId] = useState('');

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
      props.publicKey,
      creditScore
    );
    const eIncome = await encryptWithPublicKey(
      props.publicKey,
      income
    );
    const eReportDate = await encryptWithPublicKey(
      props.publicKey,
      (new Date(reportDate).getTime()).toString()
    );

    setEncryptedCreditScore(eCreditScore);
    setEncryptedIncome(eIncome);
    setEncryptedReportDate(eReportDate);
  }

  const mint = async () => {
    setMinting(true);
    setError('');
    try {
      const zksbtContract = await zksbt();

      if (!zksbtContract) {
        throw new Error("zksbtContract is null");
      }

      const mintTx = await zksbtContract.mint(
        props.address,
        root,
        [encryptedCreditScore,
        encryptedIncome,
        encryptedReportDate]
      );

      await mintTx.wait();

      const tokenId = Number(await zksbtContract.emittedCount()) - 1;

      setTokenId(tokenId.toString());
      props.setTokenId(tokenId);
    } catch (error) {
      setError(String(error));
    }
    setMinting(false);
  }

  useEffect(() => {
    setSbtAddress(zkSBTAddress.address);
  });

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
          value={encryptedCreditScore?'['+encryptedCreditScore+', '+encryptedIncome+', '+encryptedReportDate+']':''}
          readOnly error/>
        <Form.Input label='SBT smart contract address' type='text' value={sbtAddress} readOnly error/>

        <Button color='blue' onClick={mint} loading={minting}>
          Mint SBT to {props.address}</Button>

        <Message error header="Error" content={error} visible={error!=''}/>
        <Form.Input label='SBT Token ID' type='text' value={tokenId} readOnly error/>
      </Form>
    </div>
  );
};
