const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1- create a transporter
  // GMAIL TRANSPORTER

  const GMAILTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  // const transporter = nodemailer.createTransport({
  //   host: process.env.EMAIL_HOST,
  //   port: process.env.EMAIL_PORT,
  //   auth: {
  //     user: process.env.EMAIL_USERNAME,
  //     pass: process.env.EMAIL_PASSWORD,
  //   },
  // });
  // 2- define the email options

  const mailOptions = {
    from: "Mohamed El-Esnawy <hello@example.io>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  // 3- send the email with nodemailer
  await GMAILTransporter.sendMail(mailOptions);
};
module.exports = sendEmail;
