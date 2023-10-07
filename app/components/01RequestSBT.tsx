'use client';

import { useState } from 'react';
import { Wallet, ethers } from "ethers";
import { Button, Form, Message } from 'semantic-ui-react';

export default function RequestSBT (props: any) {
  const [privateKey, setPrivateKey] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [address, setAddress] = useState('');

  const generatePrivateKey = () => {
    const pKey = ethers.Wallet.createRandom().privateKey;
    const wallet: Wallet = new ethers.Wallet(
      pKey,
      ethers.getDefaultProvider("goerli")
      );
    
    setPrivateKey(pKey);
    setPublicKey(wallet.signingKey.publicKey);
    setAddress(wallet.address);
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
        <Button color='blue' onClick={generatePrivateKey}>Generate Random Private Key</Button>
        <Form.Input label='Private key' type='text' value={privateKey} readOnly error/>
        <Form.Input label='Public key' type='text' value={publicKey} readOnly error/>
        <Form.Input label='Address' type='text' value={address} readOnly error/>
        <Button color='blue' onClick={requestSBT}>Request SBT</Button>
      </Form>
    </div>
  );
};
