import algosdk, { waitForConfirmation } from 'algosdk';
import MyAlgoConnect from "@randlabs/myalgo-connect";

/* eslint import/no-webpack-loader-syntax: off */
import approvalProgram from "!!raw-loader!./asally-approval.teal";
import clearProgram from "!!raw-loader!./asally-clear.teal";

const algod = new algosdk.Algodv2('','https://node.testnet.algoexplorerapi.io', '');
const indexerClient = new algosdk.Indexer('', 'https://algoindexer.testnet.algoexplorerapi.io', '');
const myAlgoConnect = new MyAlgoConnect();



const compileProgram = async (programSource) => {
  let encoder = new TextEncoder();
  let programBytes = encoder.encode(programSource);
  let compileResponse = await algod.compile(programBytes).do();
  return new Uint8Array(Buffer.from(compileResponse.result, "base64"));
}


// I USED THIS TO CREATE THE APPLICATION AND GET THE APPLICATION ID

// CREATE PRODUCT: ApplicationCreateTxn
// export const createApplicationAction = async (accountAddress) => {
//   console.log(accountAddress);
//   let params = await algod.getTransactionParams().do();

//   // Compile programs
//   const compiledApprovalProgram = await compileProgram(approvalProgram)
//   const compiledClearProgram = await compileProgram(clearProgram)

//   let note = new TextEncoder().encode("sally:uv1");

//   // Create ApplicationCreateTxn
//   let txn = algosdk.makeApplicationCreateTxnFromObject({
//       from: accountAddress,
//       suggestedParams: params,
//       onComplete: algosdk.OnApplicationComplete.NoOpOC,
//       approvalProgram: compiledApprovalProgram,
//       clearProgram: compiledClearProgram,
//       numLocalInts: 1,
//       numLocalByteSlices: 15,
//       numGlobalInts: 1,
//       numGlobalByteSlices: 15,
//       note: note,
//   });
    
//   let txnArray = [txn]

//   let groupID = algosdk.assignGroupID(txnArray);

//   // Sign & submit the group transaction
//   let signedTxn = await myAlgoConnect.signTransaction(txnArray.map(txn => txn.toByte()));
//   console.log("Signed group transaction");
//   let tx = await algod.sendRawTransaction(signedTxn.map(txn => txn.blob)).do(); 

//   // Wait for group transaction to be confirmed
//   let confirmedTxn = await algosdk.waitForConfirmation(algod, tx.txId, 4);

//   // Get the completed Transaction
//   console.log("Transaction " + tx.txId + " confirmed in round " + confirmedTxn["confirmed-round"]);

//   // Get created application id and notify about completion
//   let transactionResponse = await algod.pendingTransactionInformation(tx.txId).do();
//   let appId = transactionResponse['application-index'];
//   console.log("Created new app-id: ", appId);
//   return appId;
// }

// export const getGlobalStateLength = async (applicationId) => {
//   const response = await indexerClient.lookupApplications(applicationId).includeAll(true).do();
//   const globalStateLength = parseInt((response.application.params["global-state"]).length);
//   return globalStateLength;
// }


// export const getLocalStateLength = async (accountAddress) => {
//   const response = await indexerClient.lookupAccountAppLocalState(accountAddress).do();
//   const localStateLength = (response["apps-local-states"]).length + 1;
//   console.log(localStateLength);
//   return localStateLength;
// }

export const optin = async (accountAddress, applicationId) => {

  let params = await algod.getTransactionParams().do();
  let optinTxn = algosdk.makeApplicationOptInTxnFromObject({
    from: accountAddress,
    appIndex: applicationId,
    onComplete: algosdk.OnApplicationComplete.OptInOC,
    suggestedParams: params
  });

  const txnArray = [optinTxn];

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
}

export const  createASA = async (accountAddress, applicationId, assetName, total, unitName, decimals, defaultFrozen) => {
  // console.log('hello asa')
  try{
    // GET GLOBAL AND LOCAL STATE LENGTH
    // const globalStateLength = await getGlobalStateLength()
    // const localStateLength = await getLocalStateLength()

    let params = await algod.getTransactionParams().do();

    // Build required app args as Uint8Array
    let createArg = new TextEncoder().encode("create_ASA")
    // let globalIndexArg = algosdk.encodeUint64(globalStateLength)
    // let localIndexArg = algosdk.encodeUint64(localStateLength)
    let assetNameArg = new TextEncoder().encode(assetName)
    let appArgs = [createArg, assetNameArg]

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
    // setASAID(confirmedTxn["asset-index"]);
  
  } catch (e) {
    console.error(`There was an error calling the app: ${e}`);
  }

}
export const sendASA = async(accountAddress, receiver, applicationId, amount, ASAID) => {
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
    console.error(`There was an error calling the app: ${e}`);
  }
}
