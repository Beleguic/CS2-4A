const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

const sendEmail = async (to, subject, htmlContent) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: to,
    subject: subject,
    html: htmlContent
  };

 try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info);
    return info; // Retourner l'info peut aider à diagnostiquer le comportement du serveur SMTP
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
};

module.exports = {
  sendEmail
};
