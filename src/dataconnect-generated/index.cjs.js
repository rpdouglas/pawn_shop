const { queryRef, executeQuery, validateArgsWithOptions, mutationRef, executeMutation, validateArgs, makeMemoryCacheProvider } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'pawnshop',
  location: 'northamerica-northeast2'
};
exports.connectorConfig = connectorConfig;
const dataConnectSettings = {
  cacheSettings: {
    cacheProvider: makeMemoryCacheProvider()
  }
};
exports.dataConnectSettings = dataConnectSettings;

const listAllPawnedItemsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAllPawnedItems');
}
listAllPawnedItemsRef.operationName = 'ListAllPawnedItems';
exports.listAllPawnedItemsRef = listAllPawnedItemsRef;

exports.listAllPawnedItems = function listAllPawnedItems(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listAllPawnedItemsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const createNewCustomerRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNewCustomer', inputVars);
}
createNewCustomerRef.operationName = 'CreateNewCustomer';
exports.createNewCustomerRef = createNewCustomerRef;

exports.createNewCustomer = function createNewCustomer(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createNewCustomerRef(dcInstance, inputVars));
}
;

const getLoanDetailsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetLoanDetails', inputVars);
}
getLoanDetailsRef.operationName = 'GetLoanDetails';
exports.getLoanDetailsRef = getLoanDetailsRef;

exports.getLoanDetails = function getLoanDetails(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getLoanDetailsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const updateItemStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateItemStatus', inputVars);
}
updateItemStatusRef.operationName = 'UpdateItemStatus';
exports.updateItemStatusRef = updateItemStatusRef;

exports.updateItemStatus = function updateItemStatus(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateItemStatusRef(dcInstance, inputVars));
}
;
