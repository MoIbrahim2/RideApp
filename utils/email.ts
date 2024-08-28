import * as nodemailer from 'nodemailer';
export const sendEmail = async (options) => {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    logger: true,
    secure: false,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const mailOptions = {
    from: 'mohamed ibrahim <mhmd.ibrahim03@mohamed.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  await transport.sendMail(mailOptions);
};

export const emailHtml = (otp) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>OTP Verification</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      text-align: center;
    }
    .otp {
      font-size: 24px;
      font-weight: bold;
      color: #333333;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <p>Your OTP code is:</p>
    <div class="otp">${otp}</div>
    <p>This code is valid for 10 minutes.</p>
  </div>
</body>
</html>
`;
