var express = require('express');
const drugBank = require('../services/drugBank');

var router = express.Router();

//request list of medications with similar name
router.get("/medication",async(req, res) => {
    const nameInput = req.query.q;
    console.log(nameInput);
    const medications = await drugBank.getMedications(nameInput);
    res.json(medications);
})

//request list of medications with similar name
router.get("/side_effects",async(req, res) => {
    const idInput = req.query.id;
    const sideEffects = await drugBank.getMedications(idInput);
    res.json(sideEffects);
})

//request list of medications with similar name
router.get("/conditions",async(req, res) => {
    const nameInput = req.query.q;
    const conditions = await drugBank.getConditions(nameInput);
    res.json(conditions);
})

module.exports = router;
