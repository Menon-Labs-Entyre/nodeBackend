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
    "validation": {
        'ADHD, ADD': {
            'Amphetamine / Dextroamphetamine [Adderall]': {
                'overdose': false,
                'wrongly_prescribed': true,
                'recommended_conditions_for_prescription': [
                    'Attention Deficit Hyperactivity Disorder'
                ]
            }
        },
        'Depression': {
            'Fluoxetine': {
                'overdose': false,
                'wrongly_prescribed': false,
                'recommended_conditions_for_prescription': [
                    'Panic Disorder (With or Without Agoraphobia)',
                     'Treatment Resistant Depression (TRD)',
                     'Depression',
                     'Myoclonus',
                     'Bulimia Nervosa',
                     'Major Depressive Disorder',
                     'Major Depressive Disorders',
                     'Anorexia Nervosa',
                     'Alcohol Dependence',
                     'Cataplexy',
                     'Obesity',
                     'Premature Ejaculation',
                     'Premenstrual Dysphoric Disorder',
                     'Low body weight',
                     'Obsessive-Compulsive Disorder'
                ]
            }
        }
    }, 

    "ddi": {
        "details": [
            {
                "medA": "Amphetamine / Dextroamphetamine [Adderall]", 
                "medB": "Fluoxetine",
                "ingredient_details": [
                    {
                        "ingredient1": 'Fluoxetine', 
                        "ingredient2": "Amphetamine", 
                        "severity": "moderate", 
                        "description": "The serum concentration of Amphetamine can be increased when it is combined with Fluoxetine."
                    }, 
                    {
                        "ingredient1": 'Fluoxetine', 
                        "ingredient2": 'Dextroamphetamine', 
                        "severity": "high", 
                        "description": "The serum concentration of Dextroamphetamine can be increased when it is combined with Fluoxetine."
                    }
                ], 
                "total_number_in_pair": 2
            }, 
            {
                "medA": "Mi",
                "medB": "Mk", 
                "ingredient_details": [
                    {
                        "ingredient1": "I1", 
                        "ingredient2": "I2", 
                        "severity": "low", 
                        "description": "N/A"
                    }
                ], 
                "total_number_in_pair": 1
            }
        ], 

        "total_number": 3, //total # of interactions found

        "percentile": 40
    }
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
        percentile: results.ddi.percentile,
        interactions: results.ddi.details,
    });
    let file = { content };
    converter.generatePdf(file, options);
}

module.exports = {
    generateReport
}

generateReport("Yiwen Zhu", FAKEUSER, FAKERES);

