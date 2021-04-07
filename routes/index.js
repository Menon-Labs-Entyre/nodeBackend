/* Load packages */
var express = require('express');
var https = require('https');
var router = express.Router();
var patientInfo = require('../services/patientInfo')

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
	console.log(demographic); //first integration with front end on Thursday?

	/*
	var diagnoses = req.body.diagnoses; //I assume this will be sent like an array of objects?

	//Inside the array I suppose it will look like this (?): 
	[
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
	]

	//having a separate section for side effects?
	var sideEffects = req.body.sideEffects; //an array? ['Heart burn', '', ...]

	let primSide = patientInfo.sepPrimSide(diagnoses, sideEffects); //separate primary diagnosis and side effects?
	let primDiag = primSide.prim;
	let sideDiag = primSide.side; //if sideDiag = [], no medication prescribed for side effects

	//What data are needed for data analysis? All of them/select some features?
	let finalData = { //final data in json format
	}
	patientInfo.sendData(finalData);
	*/
});


/** POST request when the data analysis is done */
router.post('/generate-report', async function(req, res) {

});


module.exports = router;



