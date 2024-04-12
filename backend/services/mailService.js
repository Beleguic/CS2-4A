const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  // Votre configuration SMTP ici
});

exports.sendEmail = async (to, subject, htmlContent) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject,
    html: htmlContent
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Failed to send email', error);
  }
};
