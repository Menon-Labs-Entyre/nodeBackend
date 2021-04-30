const fs = require('fs');
const ejs = require('ejs');
const converter = require('html-pdf-node');

const FAKEUSER = {
    patientInfo: {
        name: 'John Doe',
        dob: "1952-12-16", 
        age: 70,
        weight: 65,
        gender: 'Male',
        email: 'yiwzhu@seas.upenn.edu', 
        insr: 'Prudential',
        subscriber: 'John Doe',
        memId: '12345678',
        rel: 'Self',
    },
    numDiag: 2,
    diagnoses: [
        {
            diagnosis: 'ADHD, ADD',
            medication: 'Amphetamine / Dextroamphetamine [Adderall]',
            amount: '1',
            units: 'tablet',
            frequency: 'daily',
            mode: '',
            note: 'N/A'
        },
        {
            diagnosis: 'Depression',
            medication: 'Fluoxetine',
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
                'overdose': true,
                'wrongly_prescribed': true,
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
                "medA": "Medicine1",
                "medB": "Medicine2", 
                "ingredient_details": [
                    {
                        "ingredient1": "Ingredient1", 
                        "ingredient2": "Ingredient2", 
                        "severity": "low", 
                        "description": "X of Ingredient1 can be increased when it is combined with Y of Ingredient2"
                    }
                ], 
                "total_number_in_pair": 1
            }
        ], 

        "total_number": 3, //total # of interactions found

        "percentile": 40, 
        
        "weighted_number": 2, 

        "weighted_percentile": 55
    }
}

/**
 * Generate the medical report given user information and analysis results
 * @param {*} doctorName 
 * @param {*} userInput 
 * @param {*} results 
 * @returns the path of the report
 */
async function generateReport(doctorName, userInput, results) {

    if (Object.keys(userInput).length === 0) {
        userInput = FAKEUSER;
    }

    if (Object.keys(results).length === 0) {
        results = FAKERES;
    }

    for (var e of userInput.diagnoses) {
        e.overdose = results["validation"][e.diagnosis][e.medication].overdose;
        e.wrong = results["validation"][e.diagnosis][e.medication].wrongly_prescribed;
    }

    const path = `Summary-Report-${userInput.patientInfo.name}.pdf`;
    const options = { format: 'A4', path, printBackground: true };
    let content = await ejs.renderFile('./views/report.ejs', {
        logo: fs.readFileSync('./views/images/logo.png'),
        doctor: doctorName, 
        patientName: userInput.patientInfo.name,
        dateOfBirth: userInput.patientInfo.dob,
        gender: userInput.patientInfo.gender,
        email: userInput.patientInfo.email,
        relationship: userInput.patientInfo.rel,
        age: userInput.patientInfo.age,
        weight: userInput.patientInfo.weight,
        memberId: userInput.patientInfo.memId,
        subscriberName: userInput.patientInfo.subscriber,
        insuranceCompany: userInput.patientInfo.insr,
        diagnoses: userInput.diagnoses,
        sideEffects: userInput.sideEffects,
        numInteractions: results.ddi.total_number,
        percentile: results.ddi.percentile,
        wpercentile: results.ddi.weighted_percentile,
        interactions: results.ddi.details,
    });
    let file = { content };
    await converter.generatePdf(file, options);
    return path;
}

module.exports = {
    generateReport
}

generateReport("Yiwen Zhu", FAKEUSER, FAKERES);