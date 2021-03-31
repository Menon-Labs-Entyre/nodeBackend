var mysql = require('mysql');

/** Set up AWS connection */
let connection = mysql.createConnection({
	host: 'yiwen-db.cgcckfsxakvi.us-east-1.rds.amazonaws.com', 
	user: 'admin', 
	password: process.env.rds_pw, 
	database: 'entyre', 
	multipleStatements: true
});

module.exports = connection;