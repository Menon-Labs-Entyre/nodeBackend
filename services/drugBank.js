var axios = require('axios');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const host = 'https://api.drugbank.com/v1'
const apiKey = "310bffd2cf2be1608045231355596b19";//process.env.DRUGBANKAPI;
axios.defaults.headers.common['Authorization'] = apiKey

/* Based on passed in string, search for drugs with similar name */
const getMedications = async(drugName) => {
  const callEndpoint = "/drug_names" //using the simple return
  const callParamters = {
    params: {
      q: drugName,
      fuzzy: false //allows for mis-spelling in drug name
    }
  }
  const response = await axios.get(host+callEndpoint,callParamters);
  const drugNames = response.data.products.map(product => product.name);
  const uniqueDrugNames = drugNames.filter(function(elem, pos) {
    return drugNames.indexOf(elem) == pos;
  })
  return uniqueDrugNames;
}

//given the name of condition, return formalized name of conditions
const getConditions = async(conditionName) => {
  const callEndpoint = "/conditions" //using the simple return
  const callParamters = {
    params: {
      q: conditionName,
      more:"general"
    }
  }
  const response = await axios.get(host+callEndpoint,callParamters);
  const conditionNames = response.data;
  return conditionNames;
}

/* Given a drug bank ID, return a list of assosiated side-effects */
const getSideEffects = async(drugBankId) => {
  const callEndpoint = "/drugs/"+drugBankId+"/adverse_effects"; //using the simple return
  const response = await axios.get(host+callEndpoint);
  const sideEffects = response.data.map(data => data.effect.name);
  return sideEffects;
}


/* Retrieve details related to drug based on drugBankId */
/* Includes toxicitiy and clearance */
const getDrug = async(drugBankId) => {
  const callEndpoint = "/drugs/"+drugBankId; //using the simple return
  const response = await axios.get(host+callEndpoint);
  const drugInfo = response.data;
  return drugInfo;
}

const getCondition = async(conditionId) => {
  const callEndpoint = "/conditions/"+drugBankId; //using the simple return
  const response = await axios.get(host+callEndpoint);
  const conditionDetails = response.data.map(data => data.effect.name);
  return conditionDetails;
}


/* Given a list of drugBankId's  retrieve a list of interactions */
const getInteractions = async(drugBankIds) => {
  const callEndpoint = "/ddi" 
  const callParamters = {
    params: {
      drugbank_id: drugBankIds
    }
  }
  const response = await axios.get(host+callEndpoint,callParamters);
  const interactionData = response.data;
  return interactionData;
}

/* Given a condition Id, return the list of assosiated drugs linked to a condition */
const getDrugsbyCondition = async(conditionId) => {
  const callEndpoint = "/conditions/" + conditionId + "/drugs" 
  const callParamters = {
    params: {
      more: true
    }
  }
  const response = await axios.get(host+callEndpoint,callParamters);
  const drugData = response.data;
  return drugData;
}

/* Given a condition Id, return the list of assosiated drugs linked to a condition */
/* could potentially add caching to speed this whole thing up */
const getIndicationsbyCondition = async(conditionId) => {
  const callEndpoint = "/conditions/" + conditionId + "/indications" 
  const callParamters = {
    params: {
      more: true
    }
  }
  const response = await axios.get(host+callEndpoint,callParamters);
  const indiciationData = response.data;
  return indiciationData;
}

/* Given a drug Id, return the list of assosiated drugs linked to a condition */
/* could potentially add caching to speed this whole thing up */
const getIndicationsbyDrug = async(drugBankId) => {
  const callEndpoint = "/drugs/" + drugBankId + "/indications" 
  const callParamters = {
    params: {
      kind: null,
      otc_use:null,
      off_label:null
    }
  }
  const response = await axios.get(host+callEndpoint,callParamters);
  const indiciationData = response.data;
  return indiciationData;
}

const createDrugPackage = async() => {
  const drugDetails = getDrug(drugId);
  const indications = getIndicationsbyDrug(drugId);
  return {details:drugDetails,indications:indications};

}

const createPatientPackage = async() => {
  const testData = [{conditionId:null,drugBankId:null}]
  const drugIds = testData.map((diagnosis) => diagnosis.drugBankId);  // add code to make sure t here are no dups
  const conditionIds = testData.map((diagnosis) => diagnosis.conditionId); // add code to make sure t here are no dups
  const interactions = getInteractions(drugIds);
  const drugData = drugIds.map((drugId) => createDrugPackage(drugId)); 
  const conditionData = conditionIds.map((conditionId) => getCondition(conditionId)); 
  return {drugs:drugData, conditions:conditionData, interactions:interactions};
}

//export methods for use
module.exports = {
  getMedications: getMedications,
  getConditions: getConditions,
  getSideEffects: getSideEffects,
  createPatientPackage: createPatientPackage,
}
