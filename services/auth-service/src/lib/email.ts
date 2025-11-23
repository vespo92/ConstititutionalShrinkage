/**
 * Email Utilities
 *
 * Email sending functionality for verification, password reset, etc.
 * Uses a pluggable transport system (defaults to console logging in development).
 */

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface EmailTransport {
  send(options: EmailOptions): Promise<void>;
}

// Development transport - logs to console
class ConsoleTransport implements EmailTransport {
  async send(options: EmailOptions): Promise<void> {
    console.log('\n📧 Email sent (development mode):');
    console.log('━'.repeat(50));
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log('━'.repeat(50));
    console.log(options.text);
    console.log('━'.repeat(50));
  }
}

// Singleton transport instance
let transport: EmailTransport = new ConsoleTransport();

/**
 * Set custom email transport
 */
export function setEmailTransport(customTransport: EmailTransport): void {
  transport = customTransport;
}

/**
 * Send an email
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    await transport.send(options);
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error('Failed to send email');
  }
}

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const APP_NAME = 'Constitutional Shrinkage';

/**
 * Send verification email
 */
export async function sendVerificationEmail(
  email: string,
  token: string,
  name: string
): Promise<void> {
  const verifyUrl = `${BASE_URL}/auth/verify-email?token=${encodeURIComponent(token)}`;

  await sendEmail({
    to: email,
    subject: `Verify your email - ${APP_NAME}`,
    text: `
Hello ${name},

Welcome to ${APP_NAME}! Please verify your email address by clicking the link below:

${verifyUrl}

This link will expire in 24 hours.

If you did not create an account, please ignore this email.

Best regards,
The ${APP_NAME} Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Welcome to ${APP_NAME}!</h1>
    <p>Hello ${name},</p>
    <p>Please verify your email address by clicking the button below:</p>
    <a href="${verifyUrl}" class="button">Verify Email</a>
    <p>Or copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #6b7280;">${verifyUrl}</p>
    <p>This link will expire in 24 hours.</p>
    <div class="footer">
      <p>If you did not create an account, please ignore this email.</p>
      <p>Best regards,<br>The ${APP_NAME} Team</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string,
  name: string
): Promise<void> {
  const resetUrl = `${BASE_URL}/auth/reset-password?token=${encodeURIComponent(token)}`;

  await sendEmail({
    to: email,
    subject: `Reset your password - ${APP_NAME}`,
    text: `
Hello ${name},

We received a request to reset your password. Click the link below to set a new password:

${resetUrl}

This link will expire in 1 hour.

If you did not request a password reset, please ignore this email. Your password will remain unchanged.

Best regards,
The ${APP_NAME} Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .button { display: inline-block; padding: 12px 24px; background: #dc2626; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 12px; border-radius: 6px; margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Password Reset Request</h1>
    <p>Hello ${name},</p>
    <p>We received a request to reset your password. Click the button below to set a new password:</p>
    <a href="${resetUrl}" class="button">Reset Password</a>
    <p>Or copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #6b7280;">${resetUrl}</p>
    <p>This link will expire in 1 hour.</p>
    <div class="warning">
      <strong>Didn't request this?</strong><br>
      If you did not request a password reset, please ignore this email. Your password will remain unchanged.
    </div>
    <div class="footer">
      <p>Best regards,<br>The ${APP_NAME} Team</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  });
}

/**
 * Send password changed notification
 */
export async function sendPasswordChangedEmail(
  email: string,
  name: string
): Promise<void> {
  await sendEmail({
    to: email,
    subject: `Password changed - ${APP_NAME}`,
    text: `
Hello ${name},

Your password has been successfully changed.

If you did not make this change, please contact support immediately and reset your password.

Best regards,
The ${APP_NAME} Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .alert { background: #fee2e2; border: 1px solid #ef4444; padding: 12px; border-radius: 6px; margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Password Changed</h1>
    <p>Hello ${name},</p>
    <p>Your password has been successfully changed.</p>
    <div class="alert">
      <strong>Didn't make this change?</strong><br>
      If you did not change your password, please contact support immediately and reset your password.
    </div>
    <div class="footer">
      <p>Best regards,<br>The ${APP_NAME} Team</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  });
}

/**
 * Send new device login notification
 */
export async function sendNewDeviceLoginEmail(
  email: string,
  name: string,
  deviceInfo: string,
  ipAddress: string,
  timestamp: Date
): Promise<void> {
  await sendEmail({
    to: email,
    subject: `New device login - ${APP_NAME}`,
    text: `
Hello ${name},

A new device has logged into your account:

Device: ${deviceInfo}
IP Address: ${ipAddress}
Time: ${timestamp.toISOString()}

If this was you, no action is needed. If you don't recognize this login, please change your password immediately.

Best regards,
The ${APP_NAME} Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .info-box { background: #f3f4f6; padding: 16px; border-radius: 6px; margin: 20px 0; }
    .info-row { display: flex; margin: 8px 0; }
    .info-label { font-weight: 600; width: 120px; }
    .button { display: inline-block; padding: 12px 24px; background: #dc2626; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <h1>New Device Login Detected</h1>
    <p>Hello ${name},</p>
    <p>A new device has logged into your account:</p>
    <div class="info-box">
      <div class="info-row"><span class="info-label">Device:</span> ${deviceInfo}</div>
      <div class="info-row"><span class="info-label">IP Address:</span> ${ipAddress}</div>
      <div class="info-row"><span class="info-label">Time:</span> ${timestamp.toLocaleString()}</div>
    </div>
    <p>If this was you, no action is needed.</p>
    <p>If you don't recognize this login:</p>
    <a href="${BASE_URL}/auth/change-password" class="button">Change Password</a>
    <div class="footer">
      <p>Best regards,<br>The ${APP_NAME} Team</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  });
}
