import { ENV } from './env';

interface EmailNotificationParams {
  to: string;
  subject: string;
  htmlContent: string;
}

/**
 * Send email notification using Manus built-in notification API
 */
export async function sendEmailNotification({
  to,
  subject,
  htmlContent,
}: EmailNotificationParams): Promise<boolean> {
  try {
    const response = await fetch(`${ENV.forgeApiUrl}/notification/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ENV.forgeApiKey}`,
      },
      body: JSON.stringify({
        to,
        subject,
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      console.error('[Email Notification] Failed to send email:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Email Notification] Error sending email:', error);
    return false;
  }
}

/**
 * Generate HTML email template for comment notification
 */
export function generateCommentEmailTemplate({
  recipientName,
  commenterName,
  testimonyTitle,
  commentContent,
  testimonyUrl,
}: {
  recipientName: string;
  commenterName: string;
  testimonyTitle: string;
  commentContent: string;
  testimonyUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Comment on Your Testimony</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f0; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #D4AF37 0%, #B8900F 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #000000; font-size: 28px; font-weight: bold;">CHOSEN CONNECT</h1>
              <p style="margin: 10px 0 0 0; color: #333333; font-size: 14px;">A sacred gathering place for the chosen ones</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">New Comment on Your Testimony</h2>
              
              <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                Hi ${recipientName},
              </p>
              
              <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                <strong>${commenterName}</strong> commented on your testimony "<strong>${testimonyTitle}</strong>":
              </p>
              
              <div style="background-color: #f9f9f9; border-left: 4px solid #D4AF37; padding: 15px 20px; margin: 0 0 30px 0; border-radius: 4px;">
                <p style="margin: 0; color: #333333; font-size: 15px; line-height: 1.6; font-style: italic;">
                  "${commentContent}"
                </p>
              </div>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${testimonyUrl}" style="display: inline-block; background-color: #D4AF37; color: #000000; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: bold; margin: 10px 0;">
                      View Comment & Reply
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="margin: 0 0 10px 0; color: #999999; font-size: 13px;">
                You're receiving this email because you're a member of Chosen Connect.
              </p>
              <p style="margin: 0; color: #999999; font-size: 13px;">
                © ${new Date().getFullYear()} Chosen Connect. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate HTML email template for direct message notification
 */
export function generateDirectMessageEmailTemplate({
  recipientName,
  senderName,
  messagePreview,
  messagesUrl,
}: {
  recipientName: string;
  senderName: string;
  messagePreview: string;
  messagesUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Direct Message</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f0; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #D4AF37 0%, #B8900F 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #000000; font-size: 28px; font-weight: bold;">CHOSEN CONNECT</h1>
              <p style="margin: 10px 0 0 0; color: #333333; font-size: 14px;">A sacred gathering place for the chosen ones</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">New Direct Message</h2>
              
              <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                Hi ${recipientName},
              </p>
              
              <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                <strong>${senderName}</strong> sent you a message:
              </p>
              
              <div style="background-color: #f9f9f9; border-left: 4px solid #D4AF37; padding: 15px 20px; margin: 0 0 30px 0; border-radius: 4px;">
                <p style="margin: 0; color: #333333; font-size: 15px; line-height: 1.6;">
                  ${messagePreview}${messagePreview.length > 150 ? '...' : ''}
                </p>
              </div>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${messagesUrl}" style="display: inline-block; background-color: #D4AF37; color: #000000; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: bold; margin: 10px 0;">
                      Read & Reply
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="margin: 0 0 10px 0; color: #999999; font-size: 13px;">
                You're receiving this email because you're a member of Chosen Connect.
              </p>
              <p style="margin: 0; color: #999999; font-size: 13px;">
                © ${new Date().getFullYear()} Chosen Connect. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate HTML email template for welcome email to new members
 */
export function generateWelcomeEmailTemplate({
  memberName,
  dashboardUrl,
}: {
  memberName: string;
  dashboardUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Chosen Connect</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f0; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #D4AF37 0%, #B8900F 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #000000; font-size: 32px; font-weight: bold;">✨ CHOSEN CONNECT ✨</h1>
              <p style="margin: 15px 0 0 0; color: #333333; font-size: 16px; font-style: italic;">"You did not choose me, but I chose you." - John 15:16</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 26px; text-align: center;">Welcome to the Gathering! 🙏</h2>
              
              <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.8;">
                Dear ${memberName},
              </p>
              
              <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.8;">
                We're thrilled to welcome you to <strong>Chosen Connect</strong> - a sacred gathering place for those <strong>chosen and called by God</strong> to fulfill His divine purpose here on earth.
              </p>
              
              <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.8;">
                This is more than a platform—it is a <strong>sanctuary for the called</strong>, a place where believers can unite in fellowship, share their spiritual journeys, and encourage one another in faith.
              </p>
              
              <div style="background-color: #fffbf0; border: 2px solid #D4AF37; padding: 25px; margin: 0 0 30px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 15px 0; color: #D4AF37; font-size: 20px; text-align: center;">🌟 Get Started</h3>
                <ul style="margin: 0; padding-left: 20px; color: #666666; font-size: 15px; line-height: 2;">
                  <li><strong>Complete Your Profile:</strong> Share your spiritual gifts, chosen date, location, and bio</li>
                  <li><strong>Share Your Testimony:</strong> Post your gifts, visions, encounters, and revelations</li>
                  <li><strong>Connect with Believers:</strong> Follow other members and build spiritual connections</li>
                  <li><strong>Join Video Fellowship:</strong> Participate in live video chat rooms for prayer and worship</li>
                  <li><strong>Submit Prayer Requests:</strong> Share your needs and pray for others</li>
                  <li><strong>Discover Nearby Members:</strong> Find believers in your area using our map feature</li>
                </ul>
              </div>
              
              <div style="background-color: #f9f9f9; border-left: 4px solid #D4AF37; padding: 20px; margin: 0 0 30px 0; border-radius: 4px;">
                <h4 style="margin: 0 0 10px 0; color: #333333; font-size: 18px;">📖 Community Guidelines</h4>
                <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6;">
                  • Share authentically from your spiritual journey<br>
                  • Encourage and uplift fellow believers<br>
                  • Respect diverse expressions of faith<br>
                  • Maintain a spirit of love and grace<br>
                  • Keep conversations Christ-centered
                </p>
              </div>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${dashboardUrl}" style="display: inline-block; background-color: #D4AF37; color: #000000; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 18px; font-weight: bold; margin: 10px 0;">
                      Enter the Community
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0 0; color: #666666; font-size: 15px; line-height: 1.8; text-align: center; font-style: italic;">
                "For many are called, but few are chosen." - Matthew 22:14
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="margin: 0 0 10px 0; color: #999999; font-size: 13px;">
                Blessings and peace be with you on your journey.
              </p>
              <p style="margin: 0; color: #999999; font-size: 13px;">
                © ${new Date().getFullYear()} Chosen Connect. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
