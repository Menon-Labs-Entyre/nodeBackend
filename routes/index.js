/* Load packages */
var express = require('express');
var router = express.Router();
var patientInfo = require('../services/parseDiagnosis')

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
	console.log(patientInfo);

	var sess = req.session; //set unique session id
	patientData[sess.id] = {
		patientInfo: patientInfo, 
		diagnoses: null,
		sideEffects: null
	};
	console.log(sess);
	console.log(sess.id);
	console.log(patientData[sess.id]);

});

/** POST request after the user enters diagnosis details */
router.post('/diagnosis-details', async function (req, res) {
	var pid = req.session.id;
	if (!pid || !patientData[pid]) {
		res.status(401).send("Invalid session id");
	}
	patientData[pid].diagnoses = req.body.diagnoses; //probably needs to format this later
});

/** POST request after the user enters side effects */
router.post('/side-effects', async function(req, res) {
	var pid = req.session.id;
	if (!pid || !patientData[pid]) {
		res.status(401).send("Invalid session id");
	}
	patientData[pid].sideEffects = req.body.sideEffects; //needs formatting later
});

/** POST request when the user presses the submit button */
router.post('/generate-report', async function(req, res) {
	var pid = req.session.id;
	if (!pid || !patientData[pid]) {
		res.status(401).send("Invalid session id");
	}
	else if (!patientData[pid].patientInfo) {
		res.status(400).send("Patient information missing");
	}
	else if (!patientData[pid].diagnoses) {
		res.status(400).send("Diagnoses details missing");
	}
	else if (!patientData[pid].sideEffects) {
		res.status(400).send("Side effects details missing");
	}
	else {
		let finalData = { 
			patientInfo: patientData[pid].patientInfo, 
			diagnoses: patientData[pid].diagnoses,
			sideEffects: patientData[pid].sideEffects
		}
	
		parseDiagnosis.sendData(finalData);
	}

});


module.exports = router;



