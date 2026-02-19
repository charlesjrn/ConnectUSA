import { ENV } from './env';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send email using Resend API
 * Requires RESEND_API_KEY environment variable
 */
export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
  if (!ENV.resendApiKey) {
    console.error('[Email] RESEND_API_KEY not configured');
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ENV.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Chosen Connect <noreply@chosenconnect.com>',
        to: [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Email] Failed to send:', error);
      return false;
    }

    const data = await response.json();
    console.log('[Email] Sent successfully:', data.id);
    return true;
  } catch (error: any) {
    console.error('[Email] Error sending email:', error.message);
    return false;
  }
}

/**
 * Send donation thank you email
 */
export async function sendDonationThankYou(params: {
  email: string;
  name: string;
  amount: number;
  isRecurring: boolean;
}): Promise<boolean> {
  const { email, name, amount, isRecurring } = params;
  
  const subject = isRecurring 
    ? 'Thank You for Your Monthly Support! 🙏'
    : 'Thank You for Your Generous Donation! 🙏';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .amount { font-size: 36px; font-weight: bold; color: #667eea; margin: 20px 0; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✨ Thank You, ${name}! ✨</h1>
        </div>
        <div class="content">
          <p>Dear ${name},</p>
          
          <p>Your generous ${isRecurring ? 'monthly' : ''} donation of <span class="amount">$${amount.toFixed(2)}</span> has been received!</p>
          
          <p>Your support enables us to:</p>
          <ul>
            <li>Build a thriving faith community</li>
            <li>Provide spiritual resources and guidance</li>
            <li>Host transformative events and workshops</li>
            <li>Spread hope and encouragement worldwide</li>
          </ul>
          
          ${isRecurring ? `
            <p><strong>Your monthly partnership means the world to us.</strong> You're not just giving financially—you're investing in changed lives and eternal impact.</p>
          ` : `
            <p><strong>Your one-time gift makes a lasting difference.</strong> Every dollar goes directly toward supporting our ministry and community.</p>
          `}
          
          <p style="text-align: center;">
            <a href="https://chosenconnect.com/dashboard" class="button">Visit Community</a>
          </p>
          
          <p>This email serves as your donation receipt for tax purposes.</p>
          
          <p>With gratitude,<br><strong>The Chosen Connect Team</strong></p>
        </div>
        <div class="footer">
          <p>Chosen Connect | Building Faith Communities</p>
          <p>Questions? Reply to this email anytime.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
}

/**
 * Send event confirmation email
 */
export async function sendEventConfirmation(params: {
  email: string;
  name: string;
  eventTitle: string;
  eventDate: Date;
  eventType: string;
  meetingLink?: string;
  price: number;
}): Promise<boolean> {
  const { email, name, eventTitle, eventDate, eventType, meetingLink, price } = params;
  
  const subject = `You're Registered! ${eventTitle} 🎉`;
  
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .event-details { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 You're All Set! 🎉</h1>
        </div>
        <div class="content">
          <p>Dear ${name},</p>
          
          <p>Thank you for registering for <strong>${eventTitle}</strong>!</p>
          
          <div class="event-details">
            <h3 style="margin-top: 0; color: #667eea;">Event Details</h3>
            <p><strong>Event:</strong> ${eventTitle}</p>
            <p><strong>Type:</strong> ${eventType.charAt(0).toUpperCase() + eventType.slice(1)}</p>
            <p><strong>Date & Time:</strong> ${formattedDate}</p>
            <p><strong>Investment:</strong> $${price.toFixed(2)}</p>
            ${meetingLink ? `
              <p><strong>Meeting Link:</strong><br>
              <a href="${meetingLink}" style="color: #667eea; word-break: break-all;">${meetingLink}</a></p>
            ` : ''}
          </div>
          
          <p><strong>What to expect:</strong></p>
          <ul>
            <li>A transformative spiritual experience</li>
            <li>Connection with like-minded believers</li>
            <li>Practical teaching and actionable insights</li>
            <li>Q&A time with speakers and facilitators</li>
          </ul>
          
          ${meetingLink ? `
            <p style="text-align: center;">
              <a href="${meetingLink}" class="button">Join Event</a>
            </p>
          ` : `
            <p><em>Meeting details will be sent closer to the event date.</em></p>
          `}
          
          <p><strong>Add to Calendar:</strong> We recommend adding this event to your calendar so you don't miss it!</p>
          
          <p>See you there!<br><strong>The Chosen Connect Team</strong></p>
        </div>
        <div class="footer">
          <p>Chosen Connect | Building Faith Communities</p>
          <p>Questions? Reply to this email anytime.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
}
