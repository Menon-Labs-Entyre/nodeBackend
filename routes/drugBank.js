var express = require('express');
var https = require('https');
var router = express.Router();

const host = 'api.drugbank.com'
const apiKey = process.env.DRUGBANKAPI;

/* GET conditions page. */
router.get('/condition', function(request, res, next) {
  const options = {
    hostname: host,
    headers: {
      'Authorization': apiKey
    },
    path: '/v1/condition',
    method: 'GET'
  }
  const req = https.request(options, (res) => {
    console.log('headers', res.headers);
    
    res.on('data', (d) => {
      process.stdout.write(d);
    });

  });

  req.on('error', (e) => {
    console.error(e);
  });

  req.end();
});

module.exports = router;