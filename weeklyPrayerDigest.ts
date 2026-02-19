export interface PrayerDigestData {
  recipientName: string;
  urgentPrayers: Array<{
    id: number;
    title?: string;
    content: string;
    authorName: string;
    prayerCount: number;
  }>;
  answeredPrayers: Array<{
    id: number;
    title?: string;
    content: string;
    authorName: string;
    answeredTestimony: string;
  }>;
  mostPrayedFor: Array<{
    id: number;
    title?: string;
    content: string;
    authorName: string;
    prayerCount: number;
  }>;
  weekStart: string;
  weekEnd: string;
}

export function generateWeeklyPrayerDigestEmailTemplate(data: PrayerDigestData): string {
  const hasContent = data.urgentPrayers.length > 0 || data.answeredPrayers.length > 0 || data.mostPrayedFor.length > 0;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weekly Prayer Digest</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f0;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #d4a017 0%, #b8900f 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #000000; font-size: 28px; font-weight: bold;">📖 Weekly Prayer Digest</h1>
              <p style="margin: 10px 0 0; color: #333333; font-size: 14px;">${data.weekStart} - ${data.weekEnd}</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #333333;">
                Hi <strong>${data.recipientName}</strong>,
              </p>
              
              <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #333333;">
                Here's your weekly summary of prayer activity in the Chosen Connect community. Continue to stand with your brothers and sisters in prayer.
              </p>
              
              ${!hasContent ? `
              <div style="background-color: #f9f9f9; padding: 30px; text-align: center; border-radius: 8px; margin: 30px 0;">
                <p style="margin: 0; font-size: 16px; color: #666666;">
                  No prayer activity this week. Be the first to share a prayer request or lift up others in prayer!
                </p>
              </div>
              ` : ''}
              
              <!-- Urgent Prayers Section -->
              ${data.urgentPrayers.length > 0 ? `
              <div style="margin: 30px 0;">
                <h2 style="margin: 0 0 20px; font-size: 20px; color: #d32f2f; border-bottom: 2px solid #d32f2f; padding-bottom: 10px;">
                  🚨 Urgent Prayer Requests
                </h2>
                ${data.urgentPrayers.map(prayer => `
                <div style="background-color: #ffebee; border-left: 4px solid #d32f2f; padding: 20px; margin: 15px 0; border-radius: 4px;">
                  <p style="margin: 0 0 10px; font-size: 14px; font-weight: bold; color: #333333;">
                    ${prayer.authorName}
                  </p>
                  <p style="margin: 0 0 10px; font-size: 14px; line-height: 1.6; color: #333333;">
                    ${prayer.content.substring(0, 200)}${prayer.content.length > 200 ? '...' : ''}
                  </p>
                  <p style="margin: 0; font-size: 12px; color: #666666;">
                    ${prayer.prayerCount} ${prayer.prayerCount === 1 ? 'person is' : 'people are'} praying
                  </p>
                </div>
                `).join('')}
              </div>
              ` : ''}
              
              <!-- Answered Prayers Section -->
              ${data.answeredPrayers.length > 0 ? `
              <div style="margin: 30px 0;">
                <h2 style="margin: 0 0 20px; font-size: 20px; color: #2e7d32; border-bottom: 2px solid #2e7d32; padding-bottom: 10px;">
                  ✨ Answered Prayers
                </h2>
                ${data.answeredPrayers.map(prayer => `
                <div style="background-color: #e8f5e9; border-left: 4px solid #2e7d32; padding: 20px; margin: 15px 0; border-radius: 4px;">
                  <p style="margin: 0 0 10px; font-size: 14px; font-weight: bold; color: #333333;">
                    ${prayer.authorName}
                  </p>
                  <p style="margin: 0 0 10px; font-size: 14px; line-height: 1.6; color: #333333; font-style: italic;">
                    Original request: ${prayer.content.substring(0, 150)}${prayer.content.length > 150 ? '...' : ''}
                  </p>
                  <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #2e7d32; font-weight: 500;">
                    How God answered: ${prayer.answeredTestimony.substring(0, 150)}${prayer.answeredTestimony.length > 150 ? '...' : ''}
                  </p>
                </div>
                `).join('')}
              </div>
              ` : ''}
              
              <!-- Most Prayed For Section -->
              ${data.mostPrayedFor.length > 0 ? `
              <div style="margin: 30px 0;">
                <h2 style="margin: 0 0 20px; font-size: 20px; color: #d4a017; border-bottom: 2px solid #d4a017; padding-bottom: 10px;">
                  🙏 Most Prayed For
                </h2>
                ${data.mostPrayedFor.map(prayer => `
                <div style="background-color: #fff9e6; border-left: 4px solid #d4a017; padding: 20px; margin: 15px 0; border-radius: 4px;">
                  <p style="margin: 0 0 10px; font-size: 14px; font-weight: bold; color: #333333;">
                    ${prayer.authorName}
                  </p>
                  <p style="margin: 0 0 10px; font-size: 14px; line-height: 1.6; color: #333333;">
                    ${prayer.content.substring(0, 200)}${prayer.content.length > 200 ? '...' : ''}
                  </p>
                  <p style="margin: 0; font-size: 12px; color: #666666;">
                    ${prayer.prayerCount} ${prayer.prayerCount === 1 ? 'person is' : 'people are'} praying
                  </p>
                </div>
                `).join('')}
              </div>
              ` : ''}
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-top: 40px;">
                <tr>
                  <td align="center" style="padding: 0;">
                    <a href="https://chosen-connect.manus.space/prayer-requests" style="display: inline-block; background-color: #d4a017; color: #000000; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                      View All Prayer Requests
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Scripture -->
              <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e0e0e0;">
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #666666; text-align: center; font-style: italic;">
                  "Rejoice always, pray continually, give thanks in all circumstances; for this is God's will for you in Christ Jesus." - 1 Thessalonians 5:16-18
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 30px; text-align: center; border-radius: 0 0 12px 12px;">
              <p style="margin: 0 0 10px; font-size: 14px; color: #666666;">
                <strong>Chosen Connect</strong> - A sanctuary for the called
              </p>
              <p style="margin: 0; font-size: 12px; color: #999999;">
                You received this weekly prayer digest because you're a member of Chosen Connect. 
                <a href="https://chosen-connect.manus.space/email-preferences" style="color: #d4a017; text-decoration: none;">Manage email preferences</a>
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
