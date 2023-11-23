import { useState } from 'react';
import { decryptWithPrivateKey } from '../../utils/crypto';
import { Button, Form, Message } from 'semantic-ui-react';
const { genProof } = require("@/utils/snarkjs");
import { zksbt } from "@/utils/web3";

export default function GenerateZKP (props: any) {
  const [creditScore, setCreditScore] = useState('');
  const [income, setIncome] = useState('');
  const [reportDate, setReportDate] = useState('');
  const [value, setValue] = useState('');
  const [owner, setOwner] = useState('');
  const [root, setRoot] = useState('');
  const [encryptedCreditScore, setEncryptedCreditScore] = useState('');
  const [encryptedIncome, setEncryptedIncome] = useState('');
  const [encryptedReportDate, setEncryptedReportDate] = useState('');
  const [proof, setProof] = useState('');
  const [publicSignals, setPublicSignals] = useState('');

  const fieldOptions = [
    { key: '1', value: '1', text: 'creditScore' },
    { key: '2', value: '2', text: 'income' },
    { key: '3', value: '3', text: 'reportDate' }
  ];

  const operatorOptions = [
    { key: '0', value: '0', text: '==' },
    { key: '1', value: '1', text: '!=' },
    { key: '2', value: '2', text: '>' },
    { key: '3', value: '3', text: '>=' },
    { key: '4', value: '4', text: '<' },
    { key: '5', value: '5', text: '<=' },
  ];

  const readSBT = async () => {
    const owner = await zksbt.ownerOf(props.tokenId);
    setOwner(owner);

    const storedRoot = await zksbt.getRoot(props.tokenId);
    const encryptedData = await zksbt.getEncryptedData(props.tokenId);
    setRoot(storedRoot);
    setEncryptedCreditScore(encryptedData[0]);
    setEncryptedIncome(encryptedData[1]);
    setEncryptedReportDate(encryptedData[2]);
  }

  const decryptData = async () => {
    // we decrypt the data with the private key of address1
    const creditScore = await decryptWithPrivateKey(
      props.privateKey,
      encryptedCreditScore
    );
    const income = await decryptWithPrivateKey(
      props.privateKey,
      encryptedIncome
    );
    const reportDate = await decryptWithPrivateKey(
      props.privateKey,
      encryptedReportDate
    );

    setCreditScore(creditScore);
    setIncome(income);
    setReportDate(reportDate);

    if (props.field == '1') {
      setValue(creditScore);
    } else if (props.field == '2') {
      setValue(income);
    } else if (props.field == '3') {
      setValue(reportDate);
    }
  }

  const generateZKP = async () => {
    // input of ZKP
    const input = {
      index: props.field,
      root: root,
      owner: owner,
      threshold: props.threshold,
      operator: props.operator,
      value: +value,
      data: [
        owner,
        +creditScore,
        +income,
        +reportDate
      ]
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
          value={encryptedCreditScore?'['+encryptedCreditScore+', '+encryptedIncome+', '+encryptedReportDate+']':''}
          readOnly error/>
        <Form.Input label='Private key' type='text' value={props.privateKey} readOnly error/>

        <Button color='blue' onClick={decryptData}>Decrypt data</Button>

        <Form.Input label='Credit score' type='number' value={creditScore}
          onChange={(e) => setCreditScore(e.target.value)}/>
        <Form.Input label='Income' type='number' value={income}
          onChange={(e) => setIncome(e.target.value)}/>
        <Form.Input label='Report date' type='number' value={reportDate}
          onChange={(e) => setReportDate(e.target.value)}/>
        <Form.Group widths='equal'>
          <Form.Select label='Field' labeled options={fieldOptions} value={props.field}
            readOnly error/>
          <Form.Input label='Value' type='text' value={value}
            readOnly error/>
          <Form.Select label='Operator' labeled options={operatorOptions} value={props.operator}
            readOnly error/>
          <Form.Input label='Threshold' type='text' value={props.threshold}
            readOnly error/>
        </Form.Group>

        <Button color='blue' onClick={generateZKP}>Generate ZKP</Button>

        <Form.Input label='ZKP Proof' type='text' value={proof} readOnly error/>
        <Form.Input label='ZKP Public signals' type='text' value={publicSignals} readOnly error/>
      </Form>
    </div>
  );
};
