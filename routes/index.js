/* Load packages */
const express = require('express');
const router = express.Router();
const spawn = require('child_process').spawn;
const utils = require('../services/utils');
const {generateReport} = require("../services/generateReport");
const {sendReport} = require("../services/sendReport");

var numUsers = -1;
var doctorContact = {};
var patientData = {}; //keyed by numUsers

/** POST request after the doctor logs in */
router.post('/doctor-info', async function(req, res) {
	var sess = req.session;
	if (sess.user === undefined) {
		sess.user = ++numUsers; //set unique user # for each session
		req.session.save();
	}
	doctorContact[sess.user].name = req.body.name,
	doctorContact[sess.user].email = req.body.emailAddress
})

/** POST request after the user enters personal information */
router.post('/patient-information', async function(req, res) {

	var currUser = req.session.user;

	if (currUser === undefined || 
		doctorContact[currUser] === undefined) {
		res.status(401).send("Invalid session id");
	}

	info = {
		name: `${req.body.firstName} ${req.body.lastName}`,
		age: req.body.age,
		weight: req.body.weight,
		gender: req.body.gender, 
		email: req.body.emailAddress, 
		insr: req.body.companyName, 
		subscriber: req.body.subscriberName, 
		memId: req.body.memberId, 
		rel: req.body.subscriberRelationship
	}

	patientData[currUser] = {
		patientInfo: info, 
		numDiag: null, 
		diagnoses: [],
		numSideEffects: null, 
		sideEffects: []
	};

	console.log(`user # ${currUser}:`);
	console.log(patientData[currUser]);

	res.sendStatus(200);
});

/** POST request after the user enters diagnosis details */
router.post('/diagnosis-details', async function (req, res) {

	var currUser = req.session.user;

	if (currUser === undefined || 
		doctorContact[currUser] === undefined || 
		patientData[currUser] === undefined) {
		res.status(401).send("Invalid session id");

	} else {
		patientData[currUser].numDiag = req.body.numberOfDiagnosis;
		patientData[currUser].diagnoses = req.body.symptoms;
		console.log(`user # ${currUser}`);
		console.log(patientData[currUser]);
		res.sendStatus(200);
	}
});

/** POST request after the user enters side effects */
router.post('/side-effects', async function(req, res) {

	var currUser = req.session.user;

	if (currUser === undefined || 
		doctorContact[currUser] === undefined || 
		patientData[currUser] === undefined) {
		res.status(401).send("Invalid session id");

	} else {
		const data = req.body.sideEffects.map(
			e => {
				return {
					symptom: e.sideEffect,
					freq: e.frequency.label, 
					pattern: e.patterns.label
				};
			}
		);
		patientData[currUser].numSideEffects = data.length;
		patientData[currUser].sideEffects = data;
		console.log(`user # ${currUser}`);
		console.log(patientData[currUser]);
		res.sendStatus(200);
	}
});

/** POST request when the user presses the submit button */
router.post('/generate-report', async function(req, res) {
	
	var currUser = req.session.user;

	if (currUser === undefined || 
		doctorContact[currUser] === undefined || 
		patientData[currUser] === undefined) {
		res.status(401).send("Invalid session id");

	} else if (patientData[currUser].patientInfo === undefined) {
		res.status(400).send("Patient information missing");

	} else if (patientData[currUser].diagnoses === undefined) {
		res.status(400).send("Diagnoses details missing");

	} else if (patientData[currUser].sideEffects === undefined) {
		res.status(400).send("Side effects details missing");

	} else {
		res.sendStatus(200);

		const recipient = doctorContact[currUser].email;
		const doctor = doctorContact[currUser].name;
		const patient = patientData[currUser].patientInfo.name;
		
		let finalData = await utils.formatData(patientData[currUser]);
		console.log(finalData);
		console.log("===============================");
		const pyProcess = spawn('python', ['./services/app.py', finalData]);
		
		pyProcess.stdout.on('data', res => {
			// Do something with the data returned from python script
			console.log(res);
			const report = await generateReport(doctor, patientData[currUser], res);
			await sendReport(recipient, doctor, patient, report);
		});
		
	}
});

module.exports = router;



