
const getIngredients = require('./drugBank').getIngredients
/** 
 * Format the data to 
 * Desired JSON format result
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
*/

function format(data) {

}

module.exports = {
	format
}


