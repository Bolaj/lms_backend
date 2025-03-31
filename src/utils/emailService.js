const nodemailer = require("nodemailer");
const logger = require('./logger')


const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  secure: false,
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
      logger.error("Error sending email:", error);
    }
  };
