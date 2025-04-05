import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export function createBookingConfirmationEmail(
  customerName: string,
  providerName: string,
  serviceName: string,
  date: string,
  time: string,
  duration: number,
  price: number
) {
  return `
    <h1>Booking Confirmation</h1>
    <p>Hello ${customerName},</p>
    <p>Your booking has been confirmed with ${providerName}.</p>
    <h2>Booking Details:</h2>
    <ul>
      <li>Service: ${serviceName}</li>
      <li>Date: ${date}</li>
      <li>Time: ${time}</li>
      <li>Duration: ${duration} minutes</li>
      <li>Price: $${price}</li>
    </ul>
    <p>Thank you for choosing our service!</p>
  `;
}

export function createProviderNotificationEmail(
  providerName: string,
  customerName: string,
  serviceName: string,
  date: string,
  time: string,
  duration: number,
  price: number
) {
  return `
    <h1>New Booking Notification</h1>
    <p>Hello ${providerName},</p>
    <p>You have received a new booking from ${customerName}.</p>
    <h2>Booking Details:</h2>
    <ul>
      <li>Service: ${serviceName}</li>
      <li>Date: ${date}</li>
      <li>Time: ${time}</li>
      <li>Duration: ${duration} minutes</li>
      <li>Price: $${price}</li>
    </ul>
    <p>Please log in to your dashboard to manage this booking.</p>
  `;
} 