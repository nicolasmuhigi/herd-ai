import nodemailer from "nodemailer";

// Configure your email service here
// For Gmail: use an App Password (not your regular password)
// For other services: adjust the SMTP configuration accordingly

const emailUser = process.env.EMAIL_USER;
const emailPassword = process.env.EMAIL_PASSWORD;
const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || "587");
const smtpSecure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";

const transporter =
  smtpHost && emailUser && emailPassword
    ? nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: emailUser,
          pass: emailPassword,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
      })
    : emailUser && emailPassword
      ? nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: emailUser,
            pass: emailPassword,
          },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 10000,
        })
      : null;

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    if (!transporter) {
      throw new Error("Email is not configured. Set EMAIL_USER and EMAIL_PASS (and optionally EMAIL_HOST/EMAIL_PORT/EMAIL_SECURE).");
    }

    const fromAddress = process.env.EMAIL_FROM || emailUser;
    if (!fromAddress) {
      throw new Error("EMAIL_FROM environment variable is required for sending emails.");
    }
    await transporter.sendMail({
      from: fromAddress,
      ...options,
    });
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}

export function generateAppointmentEmail(
  vetEmail: string,
  userName: string,
  userEmail: string,
  appointmentDate: Date,
  reason: string
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">New Appointment Booking</h2>
      <p>You have received a new appointment booking:</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
        <p><strong>Patient Name:</strong> ${userName}</p>
        <p><strong>Patient Email:</strong> ${userEmail}</p>
        <p><strong>Appointment Date:</strong> ${appointmentDate.toLocaleString()}</p>
        <p><strong>Reason for Visit:</strong> ${reason}</p>
      </div>
      
      <p style="margin-top: 20px; color: #666; font-size: 12px;">
        Please log in to your account to confirm or reschedule this appointment.
      </p>
    </div>
  `;
}

export function generateConfirmationEmail(
  userName: string,
  appointmentDate: Date,
  reason: string
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Appointment Confirmed</h2>
      <p>Your appointment has been successfully booked!</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
        <p><strong>Name:</strong> ${userName}</p>
        <p><strong>Appointment Date:</strong> ${appointmentDate.toLocaleString()}</p>
        <p><strong>Reason:</strong> ${reason}</p>
      </div>
      
      <p style="margin-top: 20px;">
        We look forward to seeing you soon! If you need to reschedule, please contact AVEP Co Ltd at 0788 508 343 or visit us at KN 5 Rd, Kigali.
      </p>
      
      <p style="margin-top: 20px; color: #666; font-size: 12px;">
        Please do not reply to this email. Contact us through our website.
      </p>
    </div>
  `;
}
