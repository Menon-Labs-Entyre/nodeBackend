/* Load packages */
const express = require('express');
const router = express.Router();
const utils = require('../services/utils');

var numUsers = -1;
var doctorContact = {};
var patientData = {}; //keyed by numUsers

/** POST request after the doctor logs in */
router.post('/doctor-contact', async function(req, res) {
	var sess = req.session;
	if (sess.user === undefined) {
		sess.user = ++numUsers; //set unique user # for each session
		req.session.save();
	}
	doctorContact[sess.user] = {
		"name": req.body.doctorName,
		"email": req.body.doctorEmail
	}
	console.log(`User #: ${sess.user}`);
	console.log(doctorContact[sess.user]);
	res.sendStatus(200);
})

/** POST request after the user enters personal information */
router.post('/patient-information', async function(req, res) {

	var currUser = req.session.user;
	console.log(req.session);

	if (currUser === undefined || 
		doctorContact[currUser] === undefined) {
		res.status(401).send("Invalid session id");

	} else {
		var dob = new Date(req.body.dateOfBirth);
		console.log(dob);
		var year = dob.getUTCFullYear();
		var month = dob.getUTCMonth() + 1;
		var day = dob.getUTCDate();
		console.log(year + "-" + month + "-" + day);
		info = {
			name: `${req.body.firstName} ${req.body.lastName}`,
			dob: `${year}-${month}-${day}`,
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
			sideEffects: [],
			result: null
		};

		console.log(`user # ${currUser}:`);
		console.log(patientData[currUser]);

		res.sendStatus(200);
	}
	
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
		console.log("Calling server...");
		await utils.callServer(doctorContact[currUser], patientData[currUser], res);
	}
});

module.exports = router;
