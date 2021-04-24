var express = require('express');
const drugBank = require('../services/drugBank');

var router = express.Router();

//request list of medications with similar name
router.get("/product",async(req, res) => {
    const nameInput = req.query.q;
    const returnLimit = req.query.limit;
    const medications = await drugBank.getProducts(nameInput);
    res.json(medications.slice(0,returnLimit));
})

//request list of medications with similar name
router.get("/condition",async(req, res) => {
    const nameInput = req.query.q;
    const returnLimit = req.query.limit;
    const conditions = await drugBank.getConditions(nameInput);
    res.json(conditions.slice(0,returnLimit));
})

//request list of side_effects with similar name
router.get("/side_effect",async(req, res) => {
    const nameInput = req.query.q;
    const returnLimit = req.query.limit;
    const conditions = await drugBank.getConditions(nameInput);
    res.json(conditions.slice(0,returnLimit));
})

module.exports = router;
