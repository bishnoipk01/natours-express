const nodemailer = require('nodemailer');

const sendEmail = async options => {
  // 1) create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_HOST_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // 2) define email options
  const mailOptions = {
    from: `Pankaj Bishnoi <hello@pankaj.io>`,
    to: options.email,
    subject: options.subject,
    text: options.message
  };
  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
