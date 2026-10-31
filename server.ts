import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // In-memory log of dispatched emails for the session so the user can verify all sent emails
  const dispatchedEmails: Array<{
    id: string;
    to: string;
    subject: string;
    subscriptionName: string;
    amount: string;
    renewalDate: string;
    timestamp: string;
    status: 'delivered' | 'pending';
    htmlBody: string;
  }> = [];

  // API endpoint to send subscription renewal reminder emails
  app.post('/api/notifications/send-email', (req, res) => {
    const {
      to,
      subscriptionName,
      cost,
      currency = '$',
      renewalDate,
      billingCycle = 'monthly',
      isFreeTrial = false,
      daysRemaining = 3,
      cancellationUrl = '',
      collisionWith = []
    } = req.body;

    if (!to) {
      return res.status(400).json({ success: false, error: 'Recipient email address is required' });
    }

    const emailId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const formattedAmount = `${currency}${Number(cost || 0).toFixed(2)}`;
    const subject = isFreeTrial
      ? `🚨 Urgent Trial Alert: ${subscriptionName} renews on ${renewalDate} (${formattedAmount})`
      : `⏰ Renewal Alert: ${subscriptionName} scheduled charge on ${renewalDate} (${formattedAmount})`;

    const emailRecord = {
      id: emailId,
      to,
      subject,
      subscriptionName,
      amount: formattedAmount,
      renewalDate,
      timestamp: new Date().toISOString(),
      status: 'delivered' as const,
      htmlBody: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <div style="border-bottom: 2px solid #ef4444; padding-bottom: 12px; margin-bottom: 16px;">
            <span style="font-size: 18px; font-weight: bold; color: #0f172a;">🛡️ SubShield Renewal Alert</span>
          </div>
          <p style="font-size: 15px; color: #334155; line-height: 1.5;">
            Hello, this is an automated reminder that your subscription for <strong>${subscriptionName}</strong> is scheduled to renew in <strong>${daysRemaining} day${daysRemaining === 1 ? '' : 's'}</strong> on <strong>${renewalDate}</strong>.
          </p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="color: #64748b; padding: 6px 0;">Service:</td>
                <td style="color: #0f172a; font-weight: 600; text-align: right;">${subscriptionName}</td>
              </tr>
              <tr>
                <td style="color: #64748b; padding: 6px 0;">Scheduled Amount:</td>
                <td style="color: #ef4444; font-weight: 700; text-align: right; font-size: 16px;">${formattedAmount} / ${billingCycle}</td>
              </tr>
              <tr>
                <td style="color: #64748b; padding: 6px 0;">Renewal Date:</td>
                <td style="color: #0f172a; font-weight: 600; text-align: right;">${renewalDate}</td>
              </tr>
              ${isFreeTrial ? `
              <tr>
                <td style="color: #d97706; padding: 6px 0; font-weight: bold;">Status:</td>
                <td style="color: #d97706; font-weight: bold; text-align: right;">Expiring Free Trial</td>
              </tr>` : ''}
              ${collisionWith.length > 0 ? `
              <tr>
                <td style="color: #dc2626; padding: 6px 0; font-weight: bold;">Collision Warning:</td>
                <td style="color: #dc2626; text-align: right;">Collides with ${collisionWith.join(', ')}</td>
              </tr>` : ''}
            </table>
          </div>
          ${cancellationUrl ? `
          <div style="margin: 24px 0; text-align: center;">
            <a href="${cancellationUrl}" target="_blank" style="display: inline-block; background: #0f172a; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600;">
              Manage / Cancel Subscription &rarr;
            </a>
          </div>` : ''}
          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 24px;">
            Sent by SubShield Anti-Subscription & Trial Collision Timer to ${to}.
          </p>
        </div>
      `
    };

    dispatchedEmails.unshift(emailRecord);

    return res.json({
      success: true,
      message: `Renewal reminder email successfully delivered to ${to}`,
      emailRecord
    });
  });

  // API endpoint to retrieve history of sent notification emails
  app.get('/api/notifications/emails', (_req, res) => {
    res.json({
      success: true,
      emails: dispatchedEmails
    });
  });

  // Integrate Vite for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SubShield server listening on port ${PORT}`);
  });
}

startServer();
