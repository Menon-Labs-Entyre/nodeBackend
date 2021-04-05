/* Load packages */
var express = require('express');
var https = require('https');
var router = express.Router();

/** POST request from front end */
router.post('/patient-information', async function(req, res) {
	var demographic = {
		fname: req.body.firstName, //specific var name passed by front end
		lname: req.body.lastName, 
		gender: req.body.gender,
		age: req.body.age, 
		weight: req.body.weight, 
		company: req.body.companyName, 
		memId: req.body.memberId, 
		subscriber: req.body.subscriber, 
		rel: req.body.rel
	};

	var diagnoses = req.body.diagnoses; //I assume this will be sent like an array of objects?

	//Inside the array I suppose it will look like this (?): 
	/*[
		{ 
			"diagnosis": "Migraine", //diagnosis # 1, to be replaced by ICD_10
			"medication": [
				{
					"name": "Ibuprofen", //replaced with standard medication name
					"dosage": x, 
					"mode": 0, //categorical var 0 - pill, 1 - syrup, 2 - injection, ...
					"amount": 1,
					"units": 0,  //categorical as well? 0 - tablet, ...
					"frequency": 0 //0 - daily, 1 - hourly, 2 - alternate days, 3 - weekly
				}, 
				{
					"name": "Other", 
					"dosage": xx.xx, 
					"mode": xx, 
					"amount": xx,
					"units": xx, 
					"frequency": xx
				}
			]
		}, 

		{
			"diagnosis": "Heart burn", //diagnosis # 2
			"medication": [
				{
					"name": "Esmolol",
					"dosage": x, 
					"mode": 0, 
					"amount": x,
					"units": 2, 
					"frequency": 2
				}
			]

		}, 

		{
			...     //diagnosis # 3...
		}
	]*/

	//having a separate section for side effects?
	var sideEffects = req.body.sideEffects; //an array? ['Heart burn', '', ...]

	let primSide = sepPrimSide(diagnoses, sideEffects); //separate primary diagnosis and side effects?
	let primDiag = primSide.prim;
	let sideDiag = primSide.side; //if sideDiag = [], no medication prescribed for side effects

	//What data are needed for data analysis? All of them/select some features?
	let finalData = { //final data in json format
	}
	sendData(finalData);

});


/** POST request when the data analysis is done */
router.post('/generate-report', async function(req, res) {

});


/** The part below (data processing) needs to go to the services layer later */

function sepPrimSide(diagnoses, sideEffects) {
	let prim = [];
	let side = [];
	for (int i = 0; i < diagnoses.length; ++i) { //w
		if (isSideEffect(diagnoses[i].diagnosis)) {
			side.push(diagnoses[i]); 
		}
		else prim.push(diagnoses[i]);
	}
	return {prim: prim, side: side};
}

function isSideEffect(diagnosis, sideEffects) { 
	for (int i = 0; i < sideEffects.length; ++i) {
		if (diagnosis === sideEffects[i]) {
			return true;
		}
	}
	return false;
}

function sendData(finalData) {
	//Build connection with the data science server and send data
	const data = JSON.stringify(finalData);
	const options = {
		hostname: '', 
		port: ,
		path: '', 
		method: 'POST', 
		headers: {
			'Content-Type': 'application/json', 
			'Content-Length': data.length
		}
	}
	const req = https.request(options, res => {
		console.log(`statusCode: ${res.statusCode}`) //check if it worked
	});

	req.on('error', (error) => {
		console.error(error);
	});

	req.write(data);
	req.end();
}

module.exports = router;



