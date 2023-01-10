import './App.css';
import algosdk, { waitForConfirmation } from 'algosdk';
import MyAlgoConnect from "@randlabs/myalgo-connect";
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

import {  optin, createASA, sendASA } from './action';

// // connect to the algorand node
const algod = new algosdk.Algodv2('','https://node.testnet.algoexplorerapi.io', '');
const indexerClient = new algosdk.Indexer('', 'https://algoindexer.testnet.algoexplorerapi.io', '');
const myAlgoConnect = new MyAlgoConnect();

function App() {


  const [accountAddress, setAccountAddress] = useState(null);
  const [name, setName] = useState(null);
  const [balance, setBalance] = useState(0);
  
  const [decimals, setDecimals] = useState(null);
  const [total, setTotal] = useState(null);
  const [unitName, setUnitName] = useState(null);
  const [assetName, setAssetName] = useState(null);
  const [defaultFrozen, setDaultFrozen] = useState(false);

  const [receiver, setReceiver] = useState(null);
  const [ASAID, setASAID] = useState(null);
  const [amount, setAmount] = useState(null);

  const [applicationId, setApplicationId] = useState(149754267);


  const fetchBalance = async (accountAddress) => {
      indexerClient.lookupAccountByID(accountAddress).do()
          .then(response => {
              const _balance = response.account.amount;
              setBalance(_balance);
          })
          .catch(error => {
              console.log(error);
          });
  };

  const connectWallet = async () => {
      myAlgoConnect.connect()
          .then(accounts => {
              const _account = accounts[0];
              setAccountAddress(_account.address);
              setName(_account.name);
              fetchBalance(_account.address);
          }).catch(error => {
          console.log('Could not connect to MyAlgo wallet');
          console.error(error);
      })
  };

  const disconnect = () => {
      setAccountAddress(null);
      setName(null);
      setBalance(null);
  };
  const optinClick = async () => {
    optin(accountAddress, applicationId)
  }
  const createASAClick = async () => {
    // const globalStateLength = await getGlobalStateLength(applicationId);
    // const localStateLength = await getLocalStateLength(applicationId);
    // getLocalStateLength()
    createASA(accountAddress, applicationId, assetName, total, unitName, decimals, defaultFrozen)
  }

  const sendASAClick = async () => {
    sendASA(accountAddress, receiver, applicationId, amount, ASAID)
  }
 
  
  return (
    <Container className='App-header'>
      <meta name="name" content="Modified Counter App" />
      <h2>AlgoHUB Final Assessment</h2>
      <h2>Asally</h2>
      <h3>Address: {accountAddress}</h3>
      
      <Row>
        <Col>
          <Button className="btn-wallet"
          onClick={
          accountAddress ? disconnect : connectWallet
          }>
          {accountAddress ? "Disconnect" : "Connect Wallet"}
          </Button>
        </Col>
      </Row>
        
      <Container>
        <Row>
          <Col>
            <InputGroup className="mb-3">
               <Form.Control
                placeholder="Decimals E.g 0"
                aria-label="Recipient's username"
                aria-describedby="basic-addon2"
                onChange={(e) => setDecimals(parseInt(e.target.value))}
              />
            </InputGroup>
            <InputGroup className="mb-3">
              <Form.Control
                placeholder="Total"
                aria-label="Recipient's username"
                aria-describedby="basic-addon2"
                onChange={(e) => setTotal(parseInt(e.target.value))}
              />
            </InputGroup>
            <InputGroup className="mb-3">
              <Form.Control
                placeholder="ASA Symbol"
                aria-label="Recipient's username"
                aria-describedby="basic-addon2"
                onChange={(e) => setUnitName(e.target.value)}
              />
            </InputGroup>
            <InputGroup className="mb-3">
               <Form.Control
                placeholder="AssetName"
                aria-label="Recipient's username"
                aria-describedby="basic-addon2"
                onChange={(e) => setAssetName(e.target.value)}
              />
            </InputGroup>
            <Button className="btn-wallet"
            onClick={() => createASAClick()}>
              CREATE ASA
            </Button>
          </Col>

          <Col>
             <InputGroup className="mb-3">
               <Form.Control
                placeholder="Receiver"
                aria-label="Recipient's username"
                aria-describedby="basic-addon2"
                onChange={(e) => setReceiver(e.target.value)}
              />
             </InputGroup>
             <InputGroup className="mb-3">
               <Form.Control
                placeholder="ASA ID"
                aria-label="Recipient's username"
                aria-describedby="basic-addon2"
                onChange={(e) => setASAID(parseInt(e.target.value))}
                value={!isNaN(ASAID) ? ASAID : null}
              />
            </InputGroup>
            <InputGroup className="mb-3">
              <Form.Control
                placeholder="Amount"
                aria-label="Recipient's username"
                aria-describedby="basic-addon2"
                onChange={(e) => setAmount(parseInt(e.target.value))}
              />
            </InputGroup>
             <Button className="btn-wallet"
            onClick={() => sendASAClick()}>
              SEND ASA
            </Button>
           </Col>
         </Row>
       </Container>
     </Container>
   );

}

export default App;