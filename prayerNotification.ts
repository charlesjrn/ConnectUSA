export interface PrayerNotificationData {
  recipientName: string;
  prayerWarriorName: string;
  prayerRequestTitle?: string;
  prayerRequestPreview: string;
  prayerRequestUrl: string;
  prayerCount: number;
}

export function generatePrayerNotificationEmailTemplate(data: PrayerNotificationData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Someone is Praying for You</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f0;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #d4a017 0%, #b8900f 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #000000; font-size: 28px; font-weight: bold;">🙏 Someone is Praying for You</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                Hi <strong>${data.recipientName}</strong>,
              </p>
              
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                <strong>${data.prayerWarriorName}</strong> just lifted your prayer request up to God. You now have <strong>${data.prayerCount} ${data.prayerCount === 1 ? 'person' : 'people'}</strong> praying for you!
              </p>
              
              <!-- Prayer Request Preview -->
              <div style="background-color: #fff9e6; border-left: 4px solid #d4a017; padding: 20px; margin: 30px 0; border-radius: 4px;">
                ${data.prayerRequestTitle ? `<p style="margin: 0 0 10px; font-size: 16px; color: #333333; font-weight: bold;">${data.prayerRequestTitle}</p>` : ''}
                <p style="margin: 0; font-size: 14px; color: #666666; font-style: italic;">
                  "${data.prayerRequestPreview}"
                </p>
              </div>
              
              <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #333333;">
                The prayers of the righteous are powerful and effective. Be encouraged knowing that your brothers and sisters in Christ are standing with you in prayer.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 0;">
                    <a href="${data.prayerRequestUrl}" style="display: inline-block; background-color: #d4a017; color: #000000; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                      View Your Prayer Request
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Encouragement -->
              <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e0e0e0;">
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #666666; text-align: center; font-style: italic;">
                  "Therefore confess your sins to each other and pray for each other so that you may be healed. The prayer of a righteous person is powerful and effective." - James 5:16
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
                You received this email because someone prayed for your prayer request. 
                <a href="${data.prayerRequestUrl.replace('/prayer-requests', '/email-preferences')}" style="color: #d4a017; text-decoration: none;">Manage email preferences</a>
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
