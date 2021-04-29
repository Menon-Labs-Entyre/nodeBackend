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

//work in progress
router.get("/condition/filtered",async(req, res) => {
    const nameInput = req.query.q;
    const productInput = req.query.product;
    const returnLimit = req.query.limit;
    const conditionsP = drugBank.getConditions(nameInput);
    const indicationsForProduct = drugBank.getIndicationsbyProduct(drugBank.productNameToProduct[productInput].drugbank_pcid)
    const data =  await Promise.all([conditionsP,indicationsForProduct])
    const conditionsForProduct = data[1].map(indication => indication.condition.name)
    const uConditionsForProduct = [ ...new Set(conditionsForProduct)] 
    let conditions = [] 
    for(const condition of uConditionsForProduct){
        if(data[0].includes(condition)){
            conditions.push(condition);
        }
    }
    if(conditions.length == 0){
        conditions = data[0]
    }
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
