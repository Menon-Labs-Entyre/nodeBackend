
/** separate medications prescribed for primary diagnosis and side effects */
function sepPrimSide(diagnoses, sideEffects) {
	let prim = [];
	let side = [];
	for (var i = 0; i < diagnoses.length; ++i) {
		if (isSideEffect(diagnoses[i].diagnosis)) {
			side.push(diagnoses[i]); 
		}
		else prim.push(diagnoses[i]);
	}
	return {prim: prim, side: side};
}

/** check if a diagnosis entered is a side effect */
function isSideEffect(diagnosis, sideEffects) { 
	for (var i = 0; i < sideEffects.length; ++i) {
		if (diagnosis === sideEffects[i]) {
			return true;
		}
	}
	return false;
}

/** send patient information to the server for analysis */ 
//need to rewrite this if decide to call python functions directly

function sendData(finalData) {
	//Build connection with the server
	/*
	const data = JSON.stringify(finalData);
	const options = {
		hostname: '', 
		port: ,
		path: '', 
		method: 'POST', 
		headers: {
			'Content-Type': 'application/json', 
			'Content-Length': data.length
		}
	}
	const req = https.request(options, res => {
		console.log(`statusCode: ${res.statusCode}`) //check if it worked
	});

	req.on('error', (error) => {
		console.error(error);
	});

	req.write(data);
	req.end();
	*/
}

module.exports = {
	sepPrimSide, 
	sendData
}


