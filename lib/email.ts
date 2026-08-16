import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Configure Nodemailer transport using Environment Variables
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASSWORD || process.env.SMTP_PASS || '',
  },
});

const gmailFallbackTransporter =
  process.env.GMAIL_SMTP_USER && process.env.GMAIL_SMTP_APP_PASSWORD
    ? nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.GMAIL_SMTP_USER,
          pass: process.env.GMAIL_SMTP_APP_PASSWORD,
        },
      })
    : null;

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const fromName = process.env.EMAIL_FROM_NAME || 'Perennial Link Ventures';
  // Always use the verified marketplace domain unless an explicit production
  // sender is configured. SMTP_FROM may still point to Resend's test address.
  const fromEmail = process.env.EMAIL_FROM || 'info@market-plv.com';

  try {
    if (!process.env.SMTP_USER) {
      throw new Error('SMTP_USER is not configured.');
    }

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.subject,
    });
    return true;
  } catch (error) {
    console.error('Primary email delivery failed:', error);

    if (!gmailFallbackTransporter) return false;

    try {
      await gmailFallbackTransporter.sendMail({
        from: `"${fromName}" <${process.env.GMAIL_SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.subject,
      });
      console.warn('Email delivered through the Gmail fallback.');
      return true;
    } catch (fallbackError) {
      console.error('Gmail fallback email delivery failed:', fallbackError);
      return false;
    }
  }
}

/**
 * Email Template Builders
 */
export const EmailTemplates = {
  welcomeEmail: (name: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; borderRadius: 8px;">
      <h2 style="color: #0f172a;">Welcome to Perennial Link Ventures!</h2>
      <p>Hello ${name},</p>
      <p>Thank you for joining <strong>Perennial Link Ventures</strong> — the premier global business directory platform connecting businesses, investors, and clients worldwide.</p>
      <p>You can now register your businesses, manage your profile, and discover international opportunities.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #64748b;">Perennial Link Ventures &copy; ${new Date().getFullYear()}</p>
    </div>
  `,

  emailVerification: (verificationUrl: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; borderRadius: 8px;">
      <h2 style="color: #0f172a;">Verify Your Email Address</h2>
      <p>Please confirm your email address to activate your Perennial Link Ventures account.</p>
      <p style="margin: 25px 0;">
        <a href="${verificationUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Verify Email Address</a>
      </p>
      <p style="font-size: 13px; color: #64748b;">Or copy this link into your browser: <br/> ${verificationUrl}</p>
    </div>
  `,

  emailVerificationCode: (code: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #0f172a;">Verify Your Email Address</h2>
      <p>Enter this code on Perennial Link Ventures to confirm your email address. It expires in 24 hours.</p>
      <div style="font-size: 32px; font-weight: 700; color: #0f172a; letter-spacing: 8px; text-align: center; padding: 18px; background: #f0f9ff; border-radius: 8px; margin: 24px 0;">${code}</div>
      <p style="font-size: 13px; color: #64748b;">If you did not create an account, you can safely ignore this email.</p>
    </div>
  `,

  passwordReset: (resetUrl: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; borderRadius: 8px;">
      <h2 style="color: #0f172a;">Password Reset Request</h2>
      <p>We received a request to reset your password. Click the link below to choose a new password. The link is valid for 1 hour.</p>
      <p style="margin: 25px 0;">
        <a href="${resetUrl}" style="background-color: #dc2626; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
      </p>
      <p style="font-size: 13px; color: #64748b;">If you did not request a password reset, please ignore this email.</p>
    </div>
  `,

  businessStatusUpdate: (businessName: string, status: string, reason?: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; borderRadius: 8px;">
      <h2 style="color: #0f172a;">Business Listing Update</h2>
      <p>Your listing for <strong>${businessName}</strong> status has been updated to: <strong style="color: ${status === 'APPROVED' ? '#16a34a' : '#dc2626'};">${status}</strong>.</p>
      ${reason ? `<p><strong>Details / Reason:</strong> ${reason}</p>` : ''}
      <p>Log in to your business dashboard to manage your listing.</p>
    </div>
  `,

  visitorInquiry: (businessName: string, senderName: string, senderEmail: string, subject: string, message: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; borderRadius: 8px;">
      <h2 style="color: #0f172a;">New Inquiry Received for ${businessName}</h2>
      <p><strong>From:</strong> ${senderName} (${senderEmail})</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #2563eb;">
        <p style="margin:0;">${message}</p>
      </div>
      <p>Please log in to your owner dashboard to reply to this message.</p>
    </div>
  `,
};

// ─── Named export helpers used by API routes ─────────────────────────────────
export function getWelcomeEmailTemplate(name: string): string {
  return EmailTemplates.welcomeEmail(name);
}

export function getPasswordResetTemplate(name: string, resetUrl: string): string {
  return EmailTemplates.passwordReset(resetUrl);
}

export function getLoginOTPTemplate(name: string, otp: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #0f172a;">Your Login Verification Code</h2>
      <p>Hello ${name},</p>
      <p>Use the following one-time code to complete your login. It expires in <strong>10 minutes</strong>.</p>
      <div style="font-size: 36px; font-weight: bold; color: #2563eb; letter-spacing: 8px; text-align: center; padding: 20px; background: #f0f4ff; border-radius: 8px; margin: 20px 0;">
        ${otp}
      </div>
      <p style="font-size: 12px; color: #64748b;">If you did not request this code, please ignore this email.</p>
    </div>
  `;
}

export function getInquiryNotificationTemplate(
  businessName: string,
  senderName: string,
  senderEmail: string,
  senderPhone: string,
  subject: string,
  message: string
): string {
  return EmailTemplates.visitorInquiry(businessName, senderName, senderEmail, subject, message);
}
