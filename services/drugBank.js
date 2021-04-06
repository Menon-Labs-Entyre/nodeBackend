var axios = require('axios');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const host = 'https://api.drugbank.com/v1'
const apiKey = process.env.DRUGBANKAPI;
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
  return drugNames;
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

//export methods for use
module.exports = {
  getMedications: getMedications,
  getConditions: getConditions,
  getSideEffects: getSideEffects
}

