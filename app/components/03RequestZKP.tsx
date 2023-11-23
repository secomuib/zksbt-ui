import { useState } from 'react';
import { Button, Form, Message } from 'semantic-ui-react';

export default function RequestZKP (props: any) {
  const [field, setField] = useState('1');
  const [threshold, setThreshold] = useState('');
  const [operator, setOperator] = useState('3');

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

  const requestData = () => {
    props.setField(field);
    props.setThreshold(threshold);
    props.setOperator(operator);
  }

  return (  
    <div id="requestzkp" style={{ marginBottom: "20px"}}>
      <Message
        attached
        icon='eye'
        color='blue'
        header='Request ZKP'
        content='Verifier'
      />
      <Form className='attached fluid segment'>
        <Form.Group widths='equal'>
          <Form.Select label='Field' options={fieldOptions} onChange={(e, data) => {setField(String(data.value))}}/>
          <Form.Select label='Operator' options={operatorOptions} onChange={(e, data) => {setOperator(String(data.value))}}/>
          <Form.Input label='Threshold' type='number'
            onChange={(e) => setThreshold(e.target.value)}/>
        </Form.Group>
        <Button color='blue' onClick={requestData}>Request</Button>
      </Form>
    </div>
  );
};
