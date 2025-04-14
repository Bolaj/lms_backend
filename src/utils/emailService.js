require('dotenv').config(); 
const nodemailer = require("nodemailer");
const logger = require('./logger');

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? '✓ loaded' : '❌ not found');

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    logger.error("Error verifying SMTP connection: " + error.message);
  } else {
    logger.info("SMTP connection verified successfully.");
  }
});

exports.sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
    logger.info(`Email sent to ${to}`);
  } catch (error) {
    logger.error("Error sending email: " + error.message);
  }
};
