
const getIngredients = require('./drugBank').getIngredients

/** 
 * Get the ingredients associated with each med and format output
 * Desired format as below
{
	"condition A":
	{"medications": # list of dictionary
		[{"medication_name": "drugA",
		"ingredients" : # list of dictionary
			[{ "ingredient_name": "ingredientA",
				"patient_dose": "xxx kg",
				"db_dose": "Adult: xx kg/hour, Children: xx kk/hour",
				"associate_conditions":["conditionX","conditionY","conditionZ",...],
			},
			{"ingredient_name": "ingredientB",
			"patient_dose": "xxx kg",
				"db_dose": "Adult: xx kg/hour, Children: xx kk/hour",
				"associate_conditions":["conditionT","conditionS","conditionF",...],
				},....]
		},
		{"medication_name": "drugB",
		"ingredients" : [....]}]
	},
	"condition B": {"medications": [...]}
}
* @param data: diagnosis details of a specific patient
* @return stringified json output ready to be passed to python file
*/
function formatDiag(data) {

}

/**
 * Generates the final report given data analysis results
 * @param data: stringified json data containing the results of analysis
 */
function generateReport(data) {

}

module.exports = {
	formatDiag, 
	generateReport
}


