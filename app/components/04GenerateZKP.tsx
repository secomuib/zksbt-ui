import { useState } from 'react';
import { decryptWithPrivateKey } from '../../utils/crypto';
const { genProof } = require("../../utils/snarkjs");
import { Button, Form, Message } from 'semantic-ui-react';
import zkpsbt from '@/web3/zkpsbt';

export default function GenerateZKP (props: any) {
  const [creditScore, setCreditScore] = useState('');
  const [income, setIncome] = useState('');
  const [reportDate, setReportDate] = useState('');
  const [owner, setOwner] = useState('');
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
  const [proof, setProof] = useState('');
  const [publicSignals, setPublicSignals] = useState('');

  const readSBT = async () => {
    const owner = await zkpsbt.ownerOf(props.tokenId);
    setOwner(owner);

    const sbtData = await zkpsbt.sbtData(props.tokenId);
    setRoot(sbtData.root);
    setEncryptedCreditScore(sbtData.encryptedCreditScore);
    setEncryptedIncome(sbtData.encryptedIncome);
    setEncryptedReportDate(sbtData.encryptedReportDate);
  }

  const decryptData = async () => {
    // we decrypt the data with the private key of address1
    setCreditScore(await decryptWithPrivateKey(
      props.privateKey,
      encryptedCreditScore
    ));
    setIncome(await decryptWithPrivateKey(
      props.privateKey,
      encryptedIncome
    ));
    setReportDate(await decryptWithPrivateKey(
      props.privateKey,
      encryptedReportDate
    ));
  }

  const generateZKP = async () => {
    // input of ZKP
    const input = {
      root: root,
      ownerAddress: owner,
      threshold: props.threshold,
      creditScore: +creditScore,
      income: +income,
      reportDate: +reportDate
    };

    // generate ZKP proof
    try {
      const { proof, publicSignals } = await genProof(input);
      setProof(JSON.stringify(proof));
      props.setProof(JSON.stringify(proof));
      setPublicSignals(JSON.stringify(publicSignals));
      props.setPublicSignals(JSON.stringify(publicSignals));
    } catch (error) {
      setProof(String(error));
      props.setProof(String(error));
      setPublicSignals(String(error));
      props.setPublicSignals(String(error));
    }
  }

  return (
    <div id="generatezkp" style={{ marginBottom: "20px"}}>
      <Message
        attached
        icon='user'
        color='green'
        header='Read SBT & generate ZKP'
        content='Identity holder'
      />
      <Form className='attached fluid segment'>
        <Button color='blue' onClick={readSBT}>
          Read SBT (TokenId={props.tokenId})</Button>

        <Form.Input label='SBT owner' type='text' value={owner} readOnly error/>
        <Form.Input label='Merkle tree root (address/creditScore/income/reportDate)'
          type='text' value={root} readOnly error/>
        <Form.Input label='Encrypted data (with publicKey)'
          type='text'
          value={'["'+encryptedCreditScore.ciphertext+'", "'+encryptedIncome.ciphertext+'", "'+encryptedReportDate.ciphertext+'"]'}
          readOnly error/>
        <Form.Input label='Private key' type='text' value={props.privateKey} readOnly error/>

        <Button color='blue' onClick={decryptData}>Decrypt data</Button>

        <Form.Input label='Credit score' type='number' value={creditScore}
          onChange={(e) => setCreditScore(e.target.value)}/>
        <Form.Input label='Income' type='number' value={income}
          onChange={(e) => setIncome(e.target.value)}/>
        <Form.Input label='Report date' type='number' value={reportDate}
          onChange={(e) => setReportDate(e.target.value)}/>
        <Form.Input label='Threshold (>=)' type='text' value={props.threshold}
          readOnly error/>

        <Button color='blue' onClick={generateZKP}>Generate ZKP</Button>

        <Form.Input label='ZKP Proof' type='text' value={proof} readOnly error/>
        <Form.Input label='ZKP Public signals' type='text' value={publicSignals} readOnly error/>
      </Form>
    </div>
  );
};
