const drugBank = require('./drugBank');

/**
  * @desc creates an object of all related data to a product
  * @param Object productDetails - an object of product data
  * @return {Object} - returns an object containing all ingredients, indications, and details for a product
*/
const createProductPackage = async(productDetails) => {
	const indications = await drugBank.getIndicationsbyProduct(productDetails.drugbank_pcid);
	const drugDetails = await Promise.all(productDetails.ingredients.map(ingredient => drugBank.getDrug(ingredient.drug.drugbank_id)));
	return {details:productDetails,ingredients:drugDetails,indications:indications};
  }

/**
  * @desc returns all data relevant to patient diagnosises that need to be returned from the api
  * @param Object patientData - an object of all user input
  * @return {Object} - returns an object containing a list of products, conditions, and interactions
*/
const createPatientPackage = async(patientData) => {
	const products = {};
	console.log("Creating Package");
	for(const pair of patientData.diagnoses){
		products[pair.medication] = await createProductPackage(drugBank.productNameToProduct[pair.medication]) //create dictonary of products mapped from name to object
	}
	const productIds = Object.values(products).map((product) => product.details.drugbank_pcid); //create list of pcid for all products
	console.log("Pulling interactions...")
	const interactions = await drugBank.getInteractions(productIds); // pull interactions based on productIds
	console.log("Pulled Interactions")
	const conditionData = await Promise.all(patientData.diagnoses.map((pair)=> drugBank.getCondition(drugBank.conditonToId[pair.diagnosis]))); // pull data for each condition and create an array
	console.log("Package created");
	return {products:products, conditions:conditionData, interactions:interactions};
}

/**
  * @desc returns formated data relevant to patient diagnosises that need to be returned from the api to be passed to python.
  * @param Object patientData - an object of all user input
  * @return {Object} - returns an object containing a list of products, conditions, and interactions
*/
const formatData = async(userInput) => {
	const drugBankData = await createPatientPackage(userInput);
	const finalData = {}
	await userInput.diagnoses.forEach((diagnosis) => {
		const medication = drugBankData.products[diagnosis.medication];
		medication['patient_input'] = {
			dose:diagnosis.amount,
			unit:diagnosis.units,
			frequency:diagnosis.frequency,
			mode:diagnosis.mode

		}
		if(diagnosis.diagnosis in finalData){
			finalData[diagnosis.diagnosis].push(medication)
		} else {
			finalData[diagnosis.diagnosis] = [medication]
		}
	})
	return finalData;
}

/**
 * Generates the final report given data analysis results
 * @param data: stringified json data containing the results of analysis
 */
function generateReport(data) {

}

module.exports = {
	generateReport,
	createPatientPackage,
	formatData
}

