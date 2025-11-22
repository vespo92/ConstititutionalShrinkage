/**
 * Email Channel
 *
 * Email notifications via SMTP.
 */

import nodemailer, { Transporter } from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailChannel {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          }
        : undefined,
    });
  }

  /**
   * Send an email
   */
  async send(options: EmailOptions): Promise<void> {
    const fromAddress = process.env.EMAIL_FROM || 'noreply@constitutional-shrinkage.gov';
    const fromName = process.env.EMAIL_FROM_NAME || 'Constitutional Shrinkage';

    try {
      await this.transporter.sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.stripHtml(options.html),
      });

      console.log(`Email sent to ${options.to}: ${options.subject}`);
    } catch (err) {
      console.error('Failed to send email:', err);
      throw err;
    }
  }

  /**
   * Send bulk emails
   */
  async sendBulk(recipients: string[], options: Omit<EmailOptions, 'to'>): Promise<void> {
    // Use BCC for bulk sends
    const fromAddress = process.env.EMAIL_FROM || 'noreply@constitutional-shrinkage.gov';
    const fromName = process.env.EMAIL_FROM_NAME || 'Constitutional Shrinkage';

    // Send in batches of 50
    const batchSize = 50;
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);

      try {
        await this.transporter.sendMail({
          from: `"${fromName}" <${fromAddress}>`,
          bcc: batch,
          subject: options.subject,
          html: options.html,
          text: options.text || this.stripHtml(options.html),
        });

        console.log(`Bulk email sent to ${batch.length} recipients`);
      } catch (err) {
        console.error('Failed to send bulk email:', err);
      }
    }
  }

  /**
   * Verify SMTP connection
   */
  async verify(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Strip HTML tags for plain text version
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
