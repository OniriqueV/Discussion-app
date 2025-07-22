import * as nodemailer from 'nodemailer';
import { Logger } from '@nestjs/common';

const logger = new Logger('EmailService');

// Cấu hình transporter (có thể thay đổi theo nhà cung cấp email)
const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: smtpPort,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});


export async function sendEmail(to: string, subject: string, body: string) {
  try {
    // Trong môi trường development, chỉ log ra console
    if (process.env.NODE_ENV !== 'production') {
      logger.log(`[Email] To: ${to}\nSubject: ${subject}\nBody: ${body}`);
      return;
    }

    // Gửi email thật trong production
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@example.com',
      to,
      subject,
      text: body,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.log(`Email sent successfully to ${to}: ${info.messageId}`);
    
    return info;
  } catch (error) {
    logger.error(`Failed to send email to ${to}:`, error);
    throw error;
  }
}
