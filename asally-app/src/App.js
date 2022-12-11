import './App.css';
// import {PeraWalletConnect} from '@perawallet/connect';
import MyAlgoConnect from "@randlabs/myalgo-connect";
import algosdk, { waitForConfirmation } from 'algosdk';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useState } from 'react';

import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

/* eslint import/no-webpack-loader-syntax: off */
import approvalProgram from "!!raw-loader!./asally-approval.teal";
import clearProgram from "!!raw-loader!./asally-clear.teal";

// Create the PeraWalletConnect instance outside the component
// const peraWallet = new PeraWalletConnect();

// The app ID on testnet
// const appIndex = 145059995; // CHANGE TO MY OWN APP ID

// connect to the algorand node
const algod = new algosdk.Algodv2('','https://node.testnet.algoexplorerapi.io', '');
const indexerClient = new algosdk.Indexer('', 'https://algoindexer.testnet.algoexplorerapi.io', '');

export const myAlgoConnect = new MyAlgoConnect();

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

  // const applicationId = 148163834;
  const applicationId = 148174489;


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



// import {base64ToUTF8String, utf8ToBase64String} from "./conversions";

const compileProgram = async (programSource) => {
  let encoder = new TextEncoder();
  let programBytes = encoder.encode(programSource);
  let compileResponse = await algod.compile(programBytes).do();
  return new Uint8Array(Buffer.from(compileResponse.result, "base64"));
}

// I USED THIS TO CREATE THE APPLICATION AND GET THE APPLICATION ID

// CREATE PRODUCT: ApplicationCreateTxn
// const createProductAction = async (senderAddress) => {
//   console.log(accountAddress);
//   let params = await algod.getTransactionParams().do();

//   // Compile programs
//   const compiledApprovalProgram = await compileProgram(approvalProgram)
//   const compiledClearProgram = await compileProgram(clearProgram)

//   let note = new TextEncoder().encode("sally:uv1");

//   // Create ApplicationCreateTxn
//   let txn = algosdk.makeApplicationCreateTxnFromObject({
//       from: senderAddress,
//       suggestedParams: params,
//       onComplete: algosdk.OnApplicationComplete.NoOpOC,
//       approvalProgram: compiledApprovalProgram,
//       clearProgram: compiledClearProgram,
//       numLocalInts: 0,
//       numLocalByteSlices: 0,
//       numGlobalInts: 0,
//       numGlobalByteSlices: 0,
//       note: note,
//   });
    
//   let txnArray = [txn]

  // Create group transaction out of previously build transactions
  // let groupID = algosdk.computeGroupID(txnArray)
  // for (let i = 0; i < 2; i++) txnArray[i].group = groupID;

  // let groupID = algosdk.assignGroupID(txnArray);

  // // Sign & submit the group transaction
  // let signedTxn = await myAlgoConnect.signTransaction(txnArray.map(txn => txn.toByte()));
  // console.log("Signed group transaction");
  // let tx = await algod.sendRawTransaction(signedTxn.map(txn => txn.blob)).do(); 

  // // Wait for group transaction to be confirmed
  // let confirmedTxn = await algosdk.waitForConfirmation(algod, tx.txId, 4);

  // // Get the completed Transaction
  // console.log("Transaction " + tx.txId + " confirmed in round " + confirmedTxn["confirmed-round"]);

  // // Get created application id and notify about completion
  // let transactionResponse = await algod.pendingTransactionInformation(tx.txId).do();
  // let appId = transactionResponse['application-index'];
  // console.log("Created new app-id: ", appId);
  // return appId;
// }
  
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
            onClick={() => createASA()}>
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
            onClick={() => sendASA()}>
              SEND ASA
            </Button>
          </Col>
        </Row>
      </Container>
    </Container>
  );


  async function createASA() {
    // console.log('hello asa')
    try{

      let params = await algod.getTransactionParams().do();

      // Build required app args as Uint8Array
      let createArg = new TextEncoder().encode("create_ASA")
      let appArgs = [createArg]

      // Create ApplicationCallTxn
      let appCallTxn = algosdk.makeApplicationCallTxnFromObject({
          from: accountAddress,
          appIndex: applicationId,
          onComplete: algosdk.OnApplicationComplete.NoOpOC,
          suggestedParams: params,
          appArgs: appArgs
      })

      let actionTx = algosdk.makeAssetCreateTxnWithSuggestedParams(
        accountAddress, 
        undefined,
        total, 
        decimals, 
        defaultFrozen,
        accountAddress, 
        accountAddress, 
        accountAddress,
        accountAddress, 
        unitName, 
        assetName,
        'http://someurl',
        '16efaa3924a6fd9d3a4824799a4ac65d', 
        params
      )

      const txnArray = [appCallTxn, actionTx];

      // Create group transaction out of previously build transactions

      let groupID = algosdk.assignGroupID(txnArray);

      // Sign & submit the group transaction
      let signedTxn = await myAlgoConnect.signTransaction(txnArray.map(txn => txn.toByte()));
      console.log("Signed group transaction");
      let tx = await algod.sendRawTransaction(signedTxn.map(txn => txn.blob)).do(); 

      // Wait for group transaction to be confirmed
      let confirmedTxn = await waitForConfirmation(algod, tx.txId, 4);

      // Notify about completion
      console.log("Group transaction " + tx.txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
      console.log(confirmedTxn["asset-index"])
      setASAID(confirmedTxn["asset-index"]);
    
    } catch (e) {
      console.error(`There was an error calling the counter app: ${e}`);
    }

  }
  async function sendASA() {
    // console.log('hello')
    try{
      let params = await algod.getTransactionParams().do();

      // Build required app args as Uint8Array
      let sendArg = new TextEncoder().encode("send_ASA")
      let appArgs = [sendArg]

      // Create ApplicationCallTxn
      let appCallTxn = algosdk.makeApplicationCallTxnFromObject({
          from: accountAddress,
          appIndex: applicationId,
          onComplete: algosdk.OnApplicationComplete.NoOpOC,
          accounts: [accountAddress, receiver],
          foreignAssets: [parseInt(ASAID)],
          suggestedParams: params,
          appArgs: appArgs
      })

      let actionTx = algosdk.makeAssetTransferTxnWithSuggestedParams(
        accountAddress, 
        receiver,
        undefined, 
        undefined, 
        amount,
        undefined, 
        ASAID, 
        params
      )


      const txnArray = [appCallTxn, actionTx];

      // Create group transaction out of previously build transactions
      // let groupID = algosdk.computeGroupID(txnArray)
      // for (let i = 0; i < 2; i++) txnArray[i].group = groupID;

      let groupID = algosdk.assignGroupID(txnArray);

      // Sign & submit the group transaction
      let signedTxn = await myAlgoConnect.signTransaction(txnArray.map(txn => txn.toByte()));
      console.log("Signed group transaction");
      let tx = await algod.sendRawTransaction(signedTxn.map(txn => txn.blob)).do(); 

      // Wait for group transaction to be confirmed
      let confirmedTxn = await waitForConfirmation(algod, tx.txId, 4);

      // Notify about completion
      console.log("Group transaction " + tx.txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
    } catch (e) {
      console.error(`There was an error calling the counter app: ${e}`);
    }
  }

    
}

export default App;