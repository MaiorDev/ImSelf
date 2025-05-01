import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transport = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendMail(email, subject, token, user) {
  transport.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: subject,
    html: creationMailVerificationCode(token, user),
  });
}

function creationMailVerificationCode(token, user) {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .email-container {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
    }
    .email-header {
      background-color: #101218;
      color: white;
      padding: 20px;
      text-align: center;
    }
    .email-body {
      padding: 30px;
      background-color: #ffffff;
    }
    .email-footer {
      background-color: #f9f9f9;
      padding: 15px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    h1 {
      color: #ffffff;
      margin: 0;
      font-size: 24px;
    }
    h2 {
      color: #101218;
      margin-top: 0;
      font-size: 20px;
    }
    .button {
      display: inline-block;
      background-color: #3498db;
      color: white;
      text-decoration: none;
      padding: 12px 30px;
      border-radius: 4px;
      font-weight: bold;
      margin: 20px 0;
      text-align: center;
    }
    .note {
      background-color: #f8f9fa;
      padding: 15px;
      border-left: 4px solid #3498db;
      margin: 20px 0;
      font-size: 14px;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
    }
    .verification-icon {
      font-size: 48px;
      color: #3498db;
      margin-bottom: 15px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <div class="logo">ImSelf</div>
      <h1>Email Verification</h1>
    </div>
    <div class="email-body">
      <div style="text-align: center;">
        <div class="verification-icon">✉️</div>
      </div>
      <h2>Hello, ${user}!</h2>
      <p>Thank you for registering with ImSelf. To complete your registration and activate your account, please verify your email address by clicking the button below:</p>
      
      <div style="text-align: center;">
        <a href="http://localhost:3000/verify/${token}" class="button">Verify My Email</a>
      </div>
      
      <div class="note">
        <p><strong>Note:</strong> This verification link will expire in 24 hours for security reasons.</p>
      </div>
      
      <p>If the button above doesn't work, copy and paste the following link into your browser:</p>
      <p style="word-break: break-all; font-size: 14px; color: #666;">http://localhost:3000/verify/${token}</p>
      
      <p>If you didn't create an account with ImSelf, you can safely ignore this email.</p>
    </div>
    <div class="email-footer">
      <p>&copy; ${new Date().getFullYear()} ImSelf. All rights reserved.</p>
      <p>This is an automated email, please do not reply.</p>
    </div>
  </div>
</body>
</html>
`;
}
