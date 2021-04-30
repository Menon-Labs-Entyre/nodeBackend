const fs = require('fs');
const ejs = require('ejs');
const nodemailer = require('nodemailer');

const mailContent = `
    Dear Dr. <%= doctor %>, <br/><br/>
    Please find attached the analysis report you requested 
    for your patient, <%= patient %>.<br/><br/>
    Best wishes,<br/><br/>
    The Entyre Team
`;

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'menonlabsentyre@gmail.com',
        pass: 'hdolsclxtdzfpfgf'
    }
});

/**
 * Send the report to the designated email address
 * @param {*} email 
 * @param {*} doctorName 
 * @param {*} patientName 
 * @param {*} reportFile 
 */
async function sendReport(email, doctorName, patientName, reportFile) {
    const options = {
        to: email,
        subject: `Your Entyre Analysis Report: ${patientName}`,
        html: ejs.render(mailContent, { doctor: doctorName, patient: patientName }),
        attachments: [
            {
                path: reportFile
            }
        ]
    };
    await transporter.sendMail(options);
}

module.exports = {
    sendReport,
};
