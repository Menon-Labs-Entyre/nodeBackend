const ejs = require('ejs');
const nodemailer = require('nodemailer');

const mailContent = `
Dear Sir/Madam,<br/><br/>
Please find attached the analysis report you requested for your patient, <%= name %>.<br/><br/>
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

async function sendReport(email, patientName, reportFile) {
    const options = {
        to: email,
        subject: `Your Entyre Analysis Report: ${patientName}`,
        html: ejs.render(mailContent, { name: patientName }),
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

//testing
sendReport('yiwzhu@seas.upenn.edu', 'Yiwen Zhu', 'services/test.py');