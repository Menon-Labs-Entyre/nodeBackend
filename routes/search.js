var express = require('express');
const drugBank = require('../services/drugBank');

var router = express.Router();

//request list of medications with similar name
router.get("/product",async(req, res) => {
    const nameInput = req.query.q;
    const medications = await drugBank.getProducts(nameInput);
    res.json(medications);
})

//request list of medications with similar name
router.get("/conditions",async(req, res) => {
    const nameInput = req.query.q;
    const conditions = await drugBank.getConditions(nameInput);
    res.json(conditions);
})

module.exports = router;
