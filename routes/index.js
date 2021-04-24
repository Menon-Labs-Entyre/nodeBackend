/* Load packages */
const express = require('express');
const router = express.Router();
const spawn = require('child_process').spawn;
const utils = require('../services/utils');
const {generateReport} = require("../services/generateReport");
const {sendReport} = require("../services/sendReport");

var numUsers = -1;
var patientData = {}; //key is the user id

/** POST request after the user enters personal information 
 * {
		firstName: "",
		lastName: "",
		age: "",
		weight: "",
		gender: "",
		companyName: "",
		subscriberName: "",
		memberId: "",
		subscriberRelationship: ""
	}
 */
router.post('/patient-information', async function(req, res) {
	var sess = req.session;
	if (sess.user === undefined) {
		sess.user = ++numUsers; //set unique user # for each session
		req.session.save();
	}
	patientData[sess.user] = {
		patientInfo: req.body, 
		numDiag: null, 
		diagnoses: null,
		sideEffects: null
	};
	console.log(`user # ${sess.user}:`);
	console.log(patientData[sess.user]);

	//add it for testing
	const email = patientData[sess.user].patientInfo.emailAddress;
	const fname = patientData[sess.user].patientInfo.firstName;
	const lname = patientData[sess.user].patientInfo.lastName;
	const file = generateReport(patientData[sess.user], "");
	sendReport(email, `${fname} ${lname}`, file);

	res.sendStatus(200);
});

/** POST request after the user enters diagnosis details 
 * 	[
		{
			diagnosis: 'Diag1',
			medication: 'Med1',
			amount: '1',
			units: '1',
			frequency: '1',
			mode: 'Pill',
			note: 'N/A'
		},
		{
			...
		}
	]
 */
router.post('/diagnosis-details', async function (req, res) {
	console.log(req.session);
	var currUser = req.session.user;
	if (currUser === undefined || patientData[currUser] === undefined) {
		res.status(401).send("Invalid session id");
	}
	else {
		patientData[currUser].numDiag = req.body.numberOfDiagnosis;
		patientData[currUser].diagnoses = req.body.symptoms;
		console.log(`user # ${currUser}`);
		//console.log(patientData[currUser]);
		res.sendStatus(200);
		let finalData = await utils.createPatientPackage(patientData[currUser]);
		console.log(finalData)
		/**
		 * Simply for testing, will remove from this function later
		 */
    	var pyProcess = spawn('python', ['./services/test.py', finalData]);
		pyProcess.stdout.on('data', function(data) {
			console.log(data.toString());
		});
	}
});

/** POST request after the user enters side effects */
router.post('/side-effects', async function(req, res) {
	var currUser = req.session.user;
	if (currUser === undefined || patientData[currUser] === undefined) {
		res.status(401).send("Invalid session id");
	}
	else {
		patientData[currUser].sideEffects = req.body.sideEffects;
		console.log(`user # ${currUser}`);
		console.log(patientData[currUser]);
		res.sendStatus(200);
	}
});

/** POST request when the user presses the submit button */
router.post('/generate-report', async function(req, res) {
	var currUser = req.session.user;
	if (currUser === undefined || patientData[currUser] === undefined) {
		res.status(401).send("Invalid session id");
	}
	else if (patientData[currUser].patientInfo === undefined) {
		res.status(400).send("Patient information missing");
	}
	else if (patientData[currUser].diagnoses === undefined) {
		res.status(400).send("Diagnoses details missing");
	}
	else if (patientData[currUser].sideEffects === undefined) {
		res.status(400).send("Side effects details missing");
	}
	else {
		res.send(200);
		let finalData = utils.createPatientPackage(patientData[currUser]);
		const pyProcess = spawn('python', ['./services/test.py', finalData]);
		pyProcess.stdout.on('data', (data) => {
			// Do something with the data returned from python script
			console.log(data);
			//...
			const report = generateReport(JSON.stringify(data));
			const email = patientData[currUser].patientInfo.email;
			const name = patientData[currUser].patientInfo.name;
			sendReport(email, name, report);
		});
	}
});

module.exports = router;



