import { useState } from 'react';
import { Button, Form, Message } from 'semantic-ui-react';

const { verifyProof } = require("../../utils/snarkjs");

export default function VerifyZKP (props: any) {
  const [result, setResult] = useState('');

  const operatorOptions = [
    { key: '0', value: '0', text: '==' },
    { key: '1', value: '1', text: '!=' },
    { key: '2', value: '2', text: '>' },
    { key: '3', value: '3', text: '>=' },
    { key: '4', value: '4', text: '<' },
    { key: '5', value: '5', text: '<=' },
  ];

  const verifyZKP = async () => {
    const _proof = JSON.parse(props.proof);
    const _publicSignals = JSON.parse(props.publicSignals);

    try {
      const result = await verifyProof(_publicSignals, _proof);
      setResult(String(result));
    } catch (error) {
      setResult(String(error));
    }
  }

  return (
    <div id="verifyzkp" style={{ marginBottom: "20px"}}>
      <Message
        attached
        icon='eye'
        color='blue'
        header='Verify ZKP'
        content='Verifier'
      />
      <Form className='attached fluid segment'>
        <Form.Group widths='equal'>
          <Form.Select label='Operator' labeled options={operatorOptions} value={props.operator}
            readOnly error/>
          <Form.Input label='Threshold' type='text' value={props.threshold}
            readOnly error/>
        </Form.Group>
        <Form.Input label='ZKP Proof' type='text' value={props.proof} readOnly error/>
        <Form.Input label='ZKP Public signals' type='text' value={props.publicSignals} readOnly error/>

        <Button color='blue' onClick={verifyZKP}>Verify ZKP</Button>

        <Form.Input label='Result' type='text' value={result} readOnly error/>
      </Form>
    </div>
  );
};
