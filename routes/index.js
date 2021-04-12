/* Load packages */
var express = require('express');
var router = express.Router();
var parseDiagnosis = require('../services/parseDiagnosis')

var numUsers = -1;
var patientData = {}; //key is the session id

/** POST request after the user enters personal information */
router.post('/patient-information', async function(req, res) {
	var patientInfo = {
		fname: req.body.firstName, //specific var name passed by front end
		lname: req.body.lastName, 
		gender: req.body.gender,
		age: req.body.age, 
		weight: req.body.weight, 
		company: req.body.companyName, 
		memId: req.body.memberId, 
		subscriber: req.body.subscriberName, 
		rel: req.body.subscriberRelationship
	};

	var sess = req.session;
	if (sess.user === undefined) {
		sess.user = ++numUsers; //set unique user # for each session
		req.session.save();
	}

	patientData[sess.user] = {
		patientInfo: patientInfo, 
		diagnoses: null,
		sideEffects: null
	};

	console.log(`user # ${sess.user}:`);
	console.log(patientData[sess.user]);
	res.send(200);
});

/** POST request after the user enters diagnosis details */
router.post('/diagnosis-details', async function (req, res) {
	var currUser = req.session.user;
	if (currUser === undefined || patientData[currUser] === undefined) {
		res.status(401).send("Invalid session id");
	}
	else {
		patientData[currUser].diagnoses = req.body; //needs to format this later
		console.log(`user # ${currUser}`);
		console.log(patientData[currUser]);
		res.send(200);
	}
});

/** POST request after the user enters side effects */
router.post('/side-effects', async function(req, res) {
	var currUser = req.session.user;
	if (currUser === undefined || patientData[currUser] === undefined) {
		res.status(401).send("Invalid session id");
	}
	else {
		patientData[currUser].sideEffects = req.body.sideEffects; //needs formatting later
		res.send(200);
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
		let finalData = { 
			patientInfo: patientData[currUser].patientInfo, 
			diagnoses: patientData[currUser].diagnoses,
			sideEffects: patientData[currUser].sideEffects
		}
		parseDiagnosis.sendData(finalData);
		res.send(200);
	}
});

module.exports = router;



