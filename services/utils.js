const drugBank = require('./drugBank');
const spawn = require('child_process').spawn;
const { generateReport } = require("./generateReport");
const { sendReport } = require("./sendReport");

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
  * @desc populate indications wiht more indications based on relations between conditons
  * @param Array conditionData - an array of conditon obects returned from our api
  * @param Object products - an object of mappings between product names and their data
  * @return {Object} - return an updared products object with new indications added
*/
const populateIndications = (conditionData,products) => {
	const conditionVarients = {}
	//This code attempts to add new indicatiosn to eahc product based on similarities in conditions
	conditionData.forEach(condition => {
		const moreGeneral = condition.more_general.map(condition => condition.drugbank_id)
		const moreSpecific = condition.more_specific.map(condition => condition.drugbank_id)
		const allConditions = [...moreGeneral,...moreSpecific]
		allConditions.forEach(subCond => {
			conditionVarients[subCond] = condition.name;
		})
	})
	for(const product in products){
		products[product]["indications"].forEach(indication => {
			if (conditionVarients[indication] === undefined) {
				return;
			}
			if(conditionVarients[indication['condition']['drugbank_id']]){
				const similarConidition = conditionVarients[indication['condition']['drugbank_id']];
				const newIndication = indication;
				newIndication.condition = {
					"name": similarConidition,
					"drugbank_id": drugBank.conditonToId[similarConidition]
				}
				products[product]["indications"].push(newIndication)
			}
		})
	}
	return products
}

/**
  * @desc returns all data relevant to patient diagnosises that need to be returned from the api
  * @param Object patientData - an object of all user input
  * @return {Object} - returns an object containing a list of products, conditions, and interactions
*/
const createPatientPackage = async(patientData) => {
	let products = {};
	console.log("Creating Package...");
	for(const pair of patientData.diagnoses){
		console.log(pair);
		if (!(pair.medication in drugBank.productNameToProduct)) {
			await drugBank.getProducts(pair.medication);
		}
		if (!(pair.diagnosis in drugBank.conditonToId)) {
			await drugBank.getConditions(pair.diagnosis);
		}
		products[pair.medication] = await createProductPackage(drugBank.productNameToProduct[pair.medication]) //create dictonary of products mapped from name to object
	}
	const productIds = Object.values(products).map((product) => product.details.drugbank_pcid); //create list of pcid for all products
	console.log("Pulling interactions...")
	const interactions = await drugBank.getInteractions(productIds); // pull interactions based on productIds
	console.log("Pulled Interactions")
	const conditionData = await Promise.all(patientData.diagnoses.map((pair)=> drugBank.getCondition(drugBank.conditonToId[pair.diagnosis]))); // pull data for each condition and create an array
	products = populateIndications(conditionData,products)
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
	const finalData = drugBankData;
  	finalData['medication_plan'] = {};
	userInput.diagnoses.forEach((diagnosis) => {
		const medication = drugBankData.products[diagnosis.medication];
		medication['patient_input'] = {
			dose:diagnosis.amount,
			unit:diagnosis.units,
			frequency:diagnosis.frequency,
			mode:diagnosis.mode
		}
		if(diagnosis.diagnosis in finalData){
			finalData['medication_plan'][diagnosis.diagnosis].push(medication)
		} else {
			finalData['medication_plan'][diagnosis.diagnosis] = [medication]
		}
	})
  	delete finalData['products'];
	return finalData;
}

const callServer = async(doctorContact, userData, response) => {
	const doctor = doctorContact.name;
	const recipient = doctorContact.email;
	const patient = userData.patientInfo.name;

	let finalData = await formatData(userData);
	const pyProcess = spawn('python3', ['./services/app.py', JSON.stringify(finalData)]);
	
	pyProcess.stdout.on('data', async (res) => {
		const result = JSON.parse(res.toString());
		userData.result = result; //update patientData to be passed to frontend
		const reportPath = await generateReport(doctor, userData, result);
		await sendReport(recipient, doctor, patient, reportPath);

		console.log(" ================== Patient Package ====================");
		console.log(userData);
		console.log(" ===================== End ====================");
		response.json(userData);
	});

	pyProcess.stderr.on('data', (res) => {
		console.log(res.toString());
	});
}

module.exports = {
	callServer
}