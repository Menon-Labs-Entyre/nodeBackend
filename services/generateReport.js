const fs = require('fs');
const PDFDocument = require('pdfkit');

const FAKEDATA = {
    patientInfo: {
        firstName: 'John',
        lastName: 'Doe',
        age: 70,
        weight: 70,
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
    sideEffects: null,
}

function writePatientInfo(doc, info) {
    doc
        .fontSize(18)
        .text('Patient Details', { align: 'center' })
        .moveDown()
        .fontSize(12);
    doc
        .text(`Name: ${info.firstName} ${info.lastName}`)
        .text(`Date of Birth: `)
        .text(`Age: ${info.age}`)
        .text(`Gender: ${info.gender}`)
        .text(`Weight: ${info.weight} kg`);
    doc
        .moveUp(5)
        .text(`Doctor/Consultant: ${info.subscriberName}`, { align: 'right' })
        .text(`Insurer: ${info.companyName}`, {align: 'right'})
        .text(`Insurance ID: ${info.memberId}`, {align: 'right'})
        .moveDown(3);
}

function writeMedicalSummary(doc, diagnoses) {
    doc
        .fontSize(18)
        .text('Medical Summary', { align: 'center' })

    if (diagnoses !== null) {
        for (const diag of diagnoses) {
            doc
                .moveDown()
                .fontSize(12)
                .text(`Diagnosis: ${diag.diagnosis}`);
            doc
                .fontSize(12)
                .font('Helvetica')
                .text(`Medication: ${diag.medication} (${diag.amount} ${diag.units} ${diag.frequency}) (${diag.mode})`)
                .text(`Notes: ${diag.note}`);
        }
    }
    
    doc.moveDown();
}

function writeSideEffects(doc, effects) {
    doc
        .fontSize(18)
        .text('Side Effects', { align: 'center' })
        .moveDown();
}

function writeAnalysisResults(doc, results) {
    doc
        .fontSize(18)
        .text('Analysis Results', { align: 'center' })
        .moveDown();
}

/**
 * Generates the final report given data analysis results
 * @param userInput
 * @param data: stringified json data containing the results of analysis
 */
function generateReport(userInput, results) {
    let doc = new PDFDocument();
    const file = `analysis-result-${userInput.patientInfo.firstName}-${userInput.patientInfo.lastName}.pdf`;
    doc.pipe(fs.createWriteStream(file));
    writePatientInfo(doc, userInput.patientInfo);
    writeMedicalSummary(doc, userInput.diagnoses);
    writeSideEffects(doc, null);
    writeAnalysisResults(doc, null);
    doc.end();
    return file;
}

module.exports = {
    generateReport
}



