// utils/email.js
const nodemailer = require('nodemailer');

// Generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Configure email transporter
// For development, you can use a service like Mailtrap, Gmail, or other SMTP providers
const transporter = nodemailer.createTransport({
  // Configure your email provider here:
  
  // For Gmail (Less secure apps must be enabled or use App Password)
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // set these in your .env file
    pass: process.env.EMAIL_PASS,
  },
  
});

// Send email function
const sendEmail = async (to, subject, text, html = null) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Cold Drinks Wholesale" <noreply@colddrinkswholesale.com>',
      to,
      subject,
      text,
      html: html || undefined,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

module.exports = {
  generateOTP,
  sendEmail
};