const ejs = require('ejs');
const fs = require('fs');
const converter = require('html-pdf-node');

const FAKEDATA = {
    patientInfo: {
        firstName: 'John',
        lastName: 'Doe',
        age: 70,
        weight: 65,
        gender: 'Male',
        companyName: 'Prudential',
        subscriberName: 'John Doe',
        memberId: '12345678',
        subscriberRelationship: 'Self',
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
    sideEffects: [
        {
            sideEffect: 'Headache',
            frequency: 'daily',
            pattern: 'when tired'
        },
        {
            sideEffect: 'Nausea',
            frequency: 'weekly',
            pattern: 'when hungry'
        }
    ],
}

async function generateReport(userInput, results) {
    const options = { format: 'A4', path: 'test.pdf', printBackground: true };
    let content = await ejs.renderFile('./views/report.ejs', {
        logo: fs.readFileSync('./views/images/logo.png'),
        patientName: userInput.patientInfo.name,
        dateOfBirth: 'N/A',
        gender: userInput.patientInfo.gender,
        email: 'N/A',
        relationship: userInput.patientInfo.rel,
        age: userInput.patientInfo.age,
        weight: userInput.patientInfo.weight,
        memberId: userInput.patientInfo.membId,
        subscriberName: userInput.patientInfo.subscriber,
        insuranceCompany: userInput.patientInfo.insr,
        diagnoses: userInput.diagnoses,
        sideEffects: userInput.sideEffects,
    })
    let file = { content };
    converter.generatePdf(file, options).then(buffer => {
        console.log("PDF Buffer:-", buffer);
    });
}

module.exports = {
    generateReport
}
//generateReport(FAKEDATA, {});

