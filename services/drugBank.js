var axios = require('axios');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const host = 'https://api.drugbank.com/v1'
const apiKey = process.env.DRUGBANKAPI;
axios.defaults.headers.common['Authorization'] = "***REMOVED***"//apiKey

const productNameToProduct = {};
const conditonToId = {};

/**
  * @desc returns a list of medication names
  * @param string drugName - a string or partial string for thr drug name
  * @return {string[]} - array of drug names
*/
const getMedications = async(drugName) => {
  const callEndpoint = "/drug_names/simple" //using the simple return
  const callParamters = {
    params: {
      q: drugName,
      fuzzy: true //allow for poor spelling
    }
  }
  const response = await axios.get(host+callEndpoint,callParamters);
  const drugNames = response.data.products.map(product => product.name);
  //filter to only unique names
  const uniqueDrugNames = drugNames.filter(function(elem, pos) {
    return drugNames.indexOf(elem) == pos;
  })
  return uniqueDrugNames;
}

/**
  * @desc returns a list of product names and sets productNameToProduct
  * @param string productName - a string or partial string for thr product name
  * @return {string[]} - array of product names
*/
const getProducts = async(productName) => {
  const callEndpoint = "/product_concepts" 
  const callParamters = {
    params: {
      q: productName,
      max_level:2, // only return products up to level 2
      include_clinical_desc:true //return the clinical description for ingredients
    }
  }
  const response = await axios.get(host+callEndpoint,callParamters);
  const productNames = response.data.map(product => {
    if (product.display_name){
      productNameToProduct[product.display_name] = product;
      return product.display_name
    } else {
      productNameToProduct[product.name] = product;
      return product.name
    }
  });
  return productNames;
}

/**
  * @desc returns a list of condition names and sets conditonToId
  * @param string conditionName - a string or partial string for thr condition name
  * @return {string[]} - array of condition names
*/
const getConditions = async(conditionName) => {
  const callEndpoint = "/conditions" //using the simple return
  const callParamters = {
    params: {
      q: conditionName,
    }
  }
  const response = await axios.get(host+callEndpoint,callParamters);
  const conditionNames = response.data.map(condition => condition.name) //from condition list to condition name list
  response.data.forEach(condition => conditonToId[condition.name] = condition.drugbank_id); //map condition name to id
  return conditionNames;
}

/**
  * @desc returns an object of general drug information
  * @param string drugBankId - a string equal to the drugBankId related to a drug
  * @return {Object} - object cotaining API data for drug
*/
const getDrug = async(drugBankId) => {
  const callEndpoint = "/drugs/"+drugBankId; 
  const response = await axios.get(host+callEndpoint);
  const drugInfo = response.data;
  return drugInfo;
}

/**
  * @desc returns an object of general product concept information
  * @param string drugBankPcid - a string equal to the drugBankPcid related to a product concept
  * @return {Object} - object cotaining API data for product concept
*/
const getProductConcept = async(drugBankPcid) => {
  const callEndpoint = "/product_concepts/"+drugBankPcid;
  const response = await axios.get(host+callEndpoint);
  const productConceptInfo = response.data;
  return productConceptInfo;
}

/**
  * @desc returns an object of general condition information
  * @param string conditionId - a string equal to the conditionId related to a condition
  * @return {Object} - object cotaining API data for condition
*/
const getCondition = async(conditionId) => {
  const callEndpoint = "/conditions/"+conditionId;
  const response = await axios.get(host+callEndpoint);
  const conditionDetails = response.data
  return conditionDetails;
}

/**
  * @desc returns an array of drug to drug interactions for the passed in products
  * @param string drugBankIds - an array of product Concept Ids related to the products to check
  * @return {Object} - object containing API data for interactions
*/
const getInteractions = async(drugBankIds) => {
  const callEndpoint = "/ddi" 
  const callParamters = {
    params: {
      product_concept_id: drugBankIds.join(",") // create string of drugBankIds
    }
  }
  const response = await axios.get(host+callEndpoint,callParamters);
  const interactionData = response.data;
  return interactionData.interactions;
}

/**
  * @desc returns an array of indications for passed in product concept
  * @param string drugBankPcid - a string equal to the drugBankPcid related to a product concept
  * @return {Object} - object containing API data for indications for specific product concept
*/
const getIndicationsbyProduct = async(drugBankPcid) => {
  const callEndpoint = "/product_concepts/" + drugBankPcid + "/indications" 
  const callParamters = {
    params: {
      kind: null //type of indication
    }
  }
  const response = await axios.get(host+callEndpoint,callParamters);
  const indiciationData = response.data;
  return indiciationData;
}

//export methods for use
module.exports = {
  getMedications: getMedications,
  getConditions: getConditions,
  productNameToProduct: productNameToProduct,
  conditonToId: conditonToId,
  getInteractions: getInteractions,
  getDrug: getDrug,
  getCondition: getCondition,
  getProducts: getProducts,
  getIndicationsbyProduct: getIndicationsbyProduct

}


