import { sendEmailNotification } from "./emailNotification";
import * as db from "../db";

export interface DigestData {
  topTestimonies: Array<{
    id: number;
    content: string;
    userName: string;
    likesCount: number;
    commentsCount: number;
    createdAt: Date;
  }>;
  newMembers: Array<{
    id: number;
    name: string;
    bio: string | null;
    createdAt: Date;
  }>;
  unreadNotifications: number;
  weekStart: Date;
  weekEnd: Date;
}

export function generateWeeklyDigestTemplate(data: DigestData, recipientName: string): string {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weekly Digest - Chosen Connect</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #D4AF37 0%, #C5A028 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                CHOSEN CONNECT
              </h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.95;">
                Weekly Community Digest
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 30px 30px 20px 30px;">
              <p style="margin: 0; font-size: 16px; color: #333333; line-height: 1.6;">
                Hello ${recipientName},
              </p>
              <p style="margin: 15px 0 0 0; font-size: 16px; color: #666666; line-height: 1.6;">
                Here's what happened in the Chosen Connect community this week (${formatDate(data.weekStart)} - ${formatDate(data.weekEnd)}):
              </p>
            </td>
          </tr>

          ${data.topTestimonies.length > 0 ? `
          <!-- Top Testimonies Section -->
          <tr>
            <td style="padding: 20px 30px;">
              <h2 style="margin: 0 0 15px 0; font-size: 20px; color: #D4AF37; font-weight: bold;">
                ✨ Top Testimonies This Week
              </h2>
              ${data.topTestimonies.map(testimony => `
                <div style="margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #D4AF37; border-radius: 4px;">
                  <p style="margin: 0 0 8px 0; font-size: 14px; color: #999999;">
                    <strong style="color: #333333;">${testimony.userName}</strong> • ${testimony.likesCount} likes • ${testimony.commentsCount} comments
                  </p>
                  <p style="margin: 0; font-size: 15px; color: #555555; line-height: 1.5;">
                    ${testimony.content.substring(0, 150)}${testimony.content.length > 150 ? '...' : ''}
                  </p>
                  <a href="${process.env.VITE_APP_URL || 'https://chosen-connect.manus.space'}/testimony/${testimony.id}" 
                     style="display: inline-block; margin-top: 10px; color: #D4AF37; text-decoration: none; font-size: 14px; font-weight: 500;">
                    Read More →
                  </a>
                </div>
              `).join('')}
            </td>
          </tr>
          ` : ''}

          ${data.newMembers.length > 0 ? `
          <!-- New Members Section -->
          <tr>
            <td style="padding: 20px 30px;">
              <h2 style="margin: 0 0 15px 0; font-size: 20px; color: #D4AF37; font-weight: bold;">
                👋 New Members This Week
              </h2>
              ${data.newMembers.map(member => `
                <div style="margin-bottom: 15px; padding: 12px; background-color: #f9f9f9; border-radius: 4px;">
                  <p style="margin: 0 0 5px 0; font-size: 15px; color: #333333; font-weight: 600;">
                    ${member.name || 'New Member'}
                  </p>
                  ${member.bio ? `
                    <p style="margin: 0; font-size: 14px; color: #666666; line-height: 1.4;">
                      ${member.bio.substring(0, 100)}${member.bio.length > 100 ? '...' : ''}
                    </p>
                  ` : ''}
                  <a href="${process.env.VITE_APP_URL || 'https://chosen-connect.manus.space'}/user/${member.id}" 
                     style="display: inline-block; margin-top: 8px; color: #D4AF37; text-decoration: none; font-size: 13px; font-weight: 500;">
                    View Profile →
                  </a>
                </div>
              `).join('')}
            </td>
          </tr>
          ` : ''}

          ${data.unreadNotifications > 0 ? `
          <!-- Unread Notifications -->
          <tr>
            <td style="padding: 20px 30px;">
              <div style="padding: 20px; background-color: #FFF8E1; border-radius: 4px; text-align: center;">
                <p style="margin: 0 0 10px 0; font-size: 16px; color: #333333;">
                  You have <strong style="color: #D4AF37;">${data.unreadNotifications} unread notification${data.unreadNotifications > 1 ? 's' : ''}</strong>
                </p>
                <a href="${process.env.VITE_APP_URL || 'https://chosen-connect.manus.space'}/dashboard" 
                   style="display: inline-block; padding: 12px 30px; background-color: #D4AF37; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 14px;">
                  View Notifications
                </a>
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- Call to Action -->
          <tr>
            <td style="padding: 20px 30px;">
              <div style="padding: 20px; background-color: #f0f0f0; border-radius: 4px; text-align: center;">
                <p style="margin: 0 0 15px 0; font-size: 16px; color: #333333;">
                  Stay connected with the community
                </p>
                <a href="${process.env.VITE_APP_URL || 'https://chosen-connect.manus.space'}/dashboard" 
                   style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #D4AF37 0%, #C5A028 100%); color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 15px;">
                  Visit Chosen Connect
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f9f9f9; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 10px 0; font-size: 13px; color: #999999;">
                You're receiving this weekly digest because you're a member of Chosen Connect
              </p>
              <p style="margin: 0; font-size: 13px; color: #999999;">
                <a href="${process.env.VITE_APP_URL || 'https://chosen-connect.manus.space'}/email-preferences" 
                   style="color: #D4AF37; text-decoration: none;">
                  Update email preferences
                </a>
              </p>
              <p style="margin: 15px 0 0 0; font-size: 12px; color: #cccccc;">
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

export async function sendWeeklyDigest(userId: number, userEmail: string, userName: string, digestData: DigestData): Promise<boolean> {
  try {
    const emailHtml = generateWeeklyDigestTemplate(digestData, userName);
    
    return await sendEmailNotification({
      to: userEmail,
      subject: `Your Weekly Digest from Chosen Connect - ${digestData.weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      htmlContent: emailHtml,
    });
  } catch (error) {
    console.error(`Failed to send weekly digest to user ${userId}:`, error);
    return false;
  }
}
