const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

async function sendEmail({ to, subject, text, html, attachments }) {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject,
    text,
    html,
    attachments
  };
  return transporter.sendMail(mailOptions);
}

module.exports = sendEmail;
