import { useState } from 'react';
import { Button, Form, Message } from 'semantic-ui-react';

export default function RequestZKP (props: any) {
  const [threshold, setThreshold] = useState('');

  const requestData = () => {
    props.setThreshold(threshold);
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
        <Form.Input label='Threshold (>=)' type='number'
          onChange={(e) => setThreshold(e.target.value)}/>
        <Button color='blue' onClick={requestData}>Request</Button>
      </Form>
    </div>
  );
};
