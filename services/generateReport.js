const ejs = require('ejs');
const fs = require('fs');
const converter = require('html-pdf-node');

const FAKEUSER = {
    patientInfo: {
        name: 'John Doe',
        age: 70,
        weight: 65,
        gender: 'Male',
        email: 'yiwzhu@seas.upenn.edu', 
        insr: 'Prudential',
        subscriber: 'John Doe',
        membId: '12345678',
        rel: 'Self',
    },
    numDiag: 2,
    diagnoses: [
        {
            diagnosis: 'High Blood Pressure',
            medication: 'Diuretic',
            amount: '1',
            units: 'tablet',
            frequency: 'daily',
            mode: '',
            note: 'N/A'
        },
        {
            diagnosis: 'Diabetes',
            medication: 'Insulin',
            amount: '1',
            units: 'injection',
            frequency: 'as required',
            mode: '',
            note: 'N/A'
        }
    ],
    numSideEffects: 2, 
    sideEffects: [
        {
            symptom: 'Headache',
            freq: 'daily',
            pattern: 'when tired'
        },
        {
            symptom: 'Nausea',
            freq: 'weekly',
            pattern: 'when hungry'
        }
    ],
}

const FAKERES = {
    "validation": [
        {
            "medication": "MedA",  //frontend input: one condition - one medicatoin mapping
            "over_dose": true, 
            "wrongly_prescribed": false
        }, 
        {
            "medication": "MedB",
            "over_dose": false, 
            "wrongly_prescribed": true
        }
    ],

    "ddi": {
        "total_number": 2, //total # of interactions found
        "details": [
            {
                "medA": "Mi", 
                "medB": "Mj",
                "cause": "IngredientA in Mi & IngredientB in Mj",
                "level": "high", 
                "description": "", // is this doable?
            }, 
            {
                "medA": "Mi",
                "medB": "Mk", 
                "cause": "IngredientC in Mi & IngredientD in Mk", 
                "level": "low",
                "description": "", 
            }
        ]
    }, 

    "percentile": 40
}

async function generateReport(doctorName, userInput, results) {

    if (Object.keys(userInput).length === 0) {
        userInput = FAKEUSER;
    }

    if (Object.keys(results).length === 0) {
        results = FAKERES;
    }

    const options = { format: 'A4', path: 'test.pdf', printBackground: true };
    let content = await ejs.renderFile('./views/report.ejs', {
        logo: fs.readFileSync('./views/images/logo.png'),
        doctor: doctorName, 
        patientName: userInput.patientInfo.name,
        dateOfBirth: 'N/A',
        gender: userInput.patientInfo.gender,
        email: userInput.patientInfo.email,
        relationship: userInput.patientInfo.rel,
        age: userInput.patientInfo.age,
        weight: userInput.patientInfo.weight,
        memberId: userInput.patientInfo.membId,
        subscriberName: userInput.patientInfo.subscriber,
        insuranceCompany: userInput.patientInfo.insr,
        diagnoses: userInput.diagnoses,
        sideEffects: userInput.sideEffects,
        numInteractions: results.ddi.total_number,
        percentile: results.percentile,
        interactions: results.ddi.details,
    })
    let file = { content };
    converter.generatePdf(file, options).then(buffer => {
        console.log("PDF Buffer:-", buffer);
    });
}

module.exports = {
    generateReport
}

