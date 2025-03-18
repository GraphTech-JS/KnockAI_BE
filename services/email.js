import nodemailer from "nodemailer";

class EmailServise {
  constructor(gmailAddress, gmailPass) {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailAddress,
        pass: gmailPass,
      },
    });
  }

  async sendMessage(to, subject, content) {
    return new Promise((resolve, reject) => {
      const mailOptions = {
        from: this.gmailAddress,
        to,
        subject,
        html: content,
      };

      this.transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          reject(error);
        } else {
          resolve(info.response);
        }
      });
    });
  }

  generateConfirmRegistrationHtml(code, firstName, lastName) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KnockAI Registration Confirmation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f9;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            padding: 30px;
            background-color: white;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .header h1 {
            font-size: 24px;
            color: #333;
        }
        .content {
            font-size: 16px;
            color: #555;
            margin-bottom: 20px;
        }
        .code {
            font-weight: bold;
            font-size: 18px;
            color: #2a9d8f;
        }
        .cta {
            display: block;
            width: 100%;
            text-align: center;
            background-color: #2a9d8f;
            color: white;
            padding: 15px;
            text-decoration: none;
            font-size: 18px;
            border-radius: 5px;
            margin-top: 20px;
        }
        .cta:hover {
            background-color: #264653;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>KnockAI Registration Confirmation</h1>
        </div>
        <div class="content">
            <p>Dear ${firstName} ${lastName}</p>
            <p>Thank you for registering with us! To complete your registration process, please confirm your account by entering the confirmation code below:</p>
            <p class="code">${code}</p> <!-- Replace with dynamic confirmation code -->
            <p>If you did not request this registration, please ignore this email.</p>
        </div>
    </div>
</body>
</html>`;
  }
}

const GMAIL_ADDRESS = process.env.GMAIL_ADDRESS;
const GMAIL_PASSWORD = process.env.GMAIL_PASSWORD;
export default new EmailServise(GMAIL_ADDRESS, GMAIL_PASSWORD);
