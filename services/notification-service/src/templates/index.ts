/**
 * Notification Templates
 *
 * Email and notification templates for different notification types.
 */

import type { NotificationType } from '../index.js';

export class NotificationTemplates {
  private baseTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>{{title}}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1a365d; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f7fafc; }
        .button { display: inline-block; padding: 12px 24px; background: #2b6cb0; color: white; text-decoration: none; border-radius: 4px; }
        .footer { padding: 20px; text-align: center; color: #718096; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Constitutional Shrinkage</h1>
        </div>
        <div class="content">
          {{content}}
        </div>
        <div class="footer">
          <p>This is an automated message from Constitutional Shrinkage.</p>
          <p><a href="{{unsubscribeUrl}}">Manage notification preferences</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  private templates: Record<NotificationType, { subject: string; content: string }> = {
    VOTE_AVAILABLE: {
      subject: 'New Vote Available: {{billTitle}}',
      content: `
        <h2>A New Vote is Available</h2>
        <p>A bill you may be interested in is now open for voting:</p>
        <h3>{{billTitle}}</h3>
        <p>{{billSummary}}</p>
        <p>Voting ends: {{endDate}}</p>
        <p><a href="{{voteUrl}}" class="button">Cast Your Vote</a></p>
      `,
    },
    VOTE_ENDING_SOON: {
      subject: 'Voting Ends Soon: {{billTitle}}',
      content: `
        <h2>Voting Ends Soon!</h2>
        <p>Don't forget to vote on:</p>
        <h3>{{billTitle}}</h3>
        <p>Time remaining: {{timeRemaining}}</p>
        <p><a href="{{voteUrl}}" class="button">Vote Now</a></p>
      `,
    },
    VOTE_RESULT: {
      subject: 'Vote Result: {{billTitle}}',
      content: `
        <h2>Voting Results Are In</h2>
        <h3>{{billTitle}}</h3>
        <p>Status: <strong>{{status}}</strong></p>
        <ul>
          <li>For: {{forCount}} ({{forPercent}}%)</li>
          <li>Against: {{againstCount}} ({{againstPercent}}%)</li>
          <li>Abstain: {{abstainCount}}</li>
        </ul>
        <p>Total participation: {{participation}}%</p>
        <p><a href="{{billUrl}}" class="button">View Full Results</a></p>
      `,
    },
    BILL_UPDATE: {
      subject: 'Bill Updated: {{billTitle}}',
      content: `
        <h2>Bill Has Been Updated</h2>
        <h3>{{billTitle}}</h3>
        <p>{{updateDescription}}</p>
        <p><a href="{{billUrl}}" class="button">View Changes</a></p>
      `,
    },
    BILL_PASSED: {
      subject: 'Bill Passed: {{billTitle}}',
      content: `
        <h2>A Bill Has Passed!</h2>
        <h3>{{billTitle}}</h3>
        <p>This bill has passed and will become active on {{effectiveDate}}.</p>
        <p><a href="{{billUrl}}" class="button">View Bill</a></p>
      `,
    },
    BILL_REJECTED: {
      subject: 'Bill Rejected: {{billTitle}}',
      content: `
        <h2>Bill Did Not Pass</h2>
        <h3>{{billTitle}}</h3>
        <p>This bill did not receive enough votes to pass.</p>
        <p><a href="{{billUrl}}" class="button">View Results</a></p>
      `,
    },
    DELEGATION_REQUEST: {
      subject: 'Delegation Request from {{delegatorName}}',
      content: `
        <h2>Someone Wants to Delegate to You</h2>
        <p>{{delegatorName}} would like to delegate their {{scope}} votes to you.</p>
        <p><a href="{{delegationUrl}}" class="button">View Request</a></p>
      `,
    },
    DELEGATION_ACCEPTED: {
      subject: 'Your Delegation Has Been Accepted',
      content: `
        <h2>Delegation Accepted</h2>
        <p>{{delegateName}} has accepted your delegation request.</p>
        <p>Scope: {{scope}}</p>
        <p><a href="{{delegationsUrl}}" class="button">View Your Delegations</a></p>
      `,
    },
    DELEGATION_REJECTED: {
      subject: 'Delegation Request Declined',
      content: `
        <h2>Delegation Declined</h2>
        <p>{{delegateName}} has declined your delegation request.</p>
        <p><a href="{{delegationsUrl}}" class="button">Find Another Delegate</a></p>
      `,
    },
    DELEGATION_USED: {
      subject: 'Your Delegated Vote Was Cast',
      content: `
        <h2>Your Delegation Was Used</h2>
        <p>{{delegateName}} voted on your behalf:</p>
        <h3>{{billTitle}}</h3>
        <p>Vote: {{voteChoice}}</p>
        <p>You can override this vote if you disagree.</p>
        <p><a href="{{overrideUrl}}" class="button">Override Vote</a></p>
      `,
    },
    REGION_ANNOUNCEMENT: {
      subject: 'Announcement from {{regionName}}',
      content: `
        <h2>Regional Announcement</h2>
        <h3>{{announcementTitle}}</h3>
        <p>{{announcementBody}}</p>
        <p><a href="{{regionUrl}}" class="button">View Region</a></p>
      `,
    },
    SYSTEM_ALERT: {
      subject: 'System Alert: {{alertTitle}}',
      content: `
        <h2>{{alertTitle}}</h2>
        <p>{{alertBody}}</p>
      `,
    },
    VERIFICATION_COMPLETE: {
      subject: 'Verification Complete',
      content: `
        <h2>Verification Successful!</h2>
        <p>Your verification level has been upgraded to: <strong>{{verificationLevel}}</strong></p>
        <p>You now have access to additional features.</p>
        <p><a href="{{profileUrl}}" class="button">View Profile</a></p>
      `,
    },
  };

  /**
   * Get email template for notification type
   */
  getEmailTemplate(type: NotificationType, data: Record<string, unknown>): string {
    const template = this.templates[type];
    if (!template) {
      throw new Error(`Unknown notification type: ${type}`);
    }

    let content = template.content;
    let subject = template.subject;

    // Replace placeholders
    for (const [key, value] of Object.entries(data)) {
      const placeholder = `{{${key}}}`;
      content = content.replace(new RegExp(placeholder, 'g'), String(value));
      subject = subject.replace(new RegExp(placeholder, 'g'), String(value));
    }

    // Wrap in base template
    const html = this.baseTemplate
      .replace('{{title}}', subject)
      .replace('{{content}}', content)
      .replace('{{unsubscribeUrl}}', String(data.unsubscribeUrl || '/notifications/preferences'));

    return html;
  }

  /**
   * Get subject line for notification type
   */
  getSubject(type: NotificationType, data: Record<string, unknown>): string {
    const template = this.templates[type];
    if (!template) {
      return 'Notification';
    }

    let subject = template.subject;
    for (const [key, value] of Object.entries(data)) {
      subject = subject.replace(`{{${key}}}`, String(value));
    }

    return subject;
  }

  /**
   * Get plain text content
   */
  getPlainText(type: NotificationType, data: Record<string, unknown>): string {
    const template = this.templates[type];
    if (!template) {
      return '';
    }

    let content = template.content;
    for (const [key, value] of Object.entries(data)) {
      content = content.replace(`{{${key}}}`, String(value));
    }

    // Strip HTML
    return content
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
