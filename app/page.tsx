'use client';

import { Container } from 'semantic-ui-react';
import Header from './components/header';
import RequestSBT from './components/01RequestSBT';
import MintSBT from './components/02MintSBT';
import RequestZKP from './components/03RequestZKP';
import GenerateZKP from './components/04GenerateZKP';
import VerifyZKP from './components/05VerifyZKP';
import Footer from './components/footer';
import { useState } from 'react';

export default function Home() {
  const [privateKey, setPrivatKey] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [address, setAddress] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [field, setField] = useState('1');
  const [threshold, setThreshold] = useState('');
  const [operator, setOperator] = useState('3');
  const [proof, setProof] = useState('');
  const [publicSignals, setPublicSignals] = useState('');

  return (
    <Container>
      <Header/>
      <RequestSBT setPrivateKey={setPrivatKey} setPublicKey={setPublicKey} setAddress={setAddress}/>
      <MintSBT publicKey={publicKey} address={address} setTokenId={setTokenId}/>
      <RequestZKP setField={setField} setThreshold={setThreshold} setOperator={setOperator}/>
      <GenerateZKP privateKey={privateKey} tokenId={tokenId} threshold={threshold}
          operator={operator} setProof={setProof} setPublicSignals={setPublicSignals}/>
      <VerifyZKP threshold={threshold} operator={operator} proof={proof} publicSignals={publicSignals}/>
      <Footer/>
    </Container>
  )
}
