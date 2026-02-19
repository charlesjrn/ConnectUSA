import { sendEmailNotification } from "./emailNotification";

export function generateWelcomeEmailTemplate(userName: string): string {
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
                Dear ${userName},
              </p>
              
              <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.8;">
                We're thrilled to welcome you to <strong>Chosen Connect</strong> - a sacred gathering place for those <strong>chosen and called by God</strong> to fulfill His divine purpose here on earth and to bring people to Christ.
              </p>
              
              <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.8;">
                This is more than a platform—it is a <strong>sanctuary for the called</strong>, a place where believers can unite in fellowship, share their spiritual journeys, and encourage one another in faith.
              </p>
              
              <div style="background-color: #fffbf0; border: 2px solid #D4AF37; padding: 25px; margin: 0 0 30px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 15px 0; color: #D4AF37; font-size: 20px; text-align: center;">🌟 Get Started</h3>
                <ul style="margin: 0; padding-left: 20px; color: #666666; font-size: 15px; line-height: 2;">
                  <li><strong>Complete Your Profile:</strong> Share your spiritual gifts, chosen date, location, and bio to help others connect with you</li>
                  <li><strong>Share Your Testimony:</strong> Post your gifts, visions, encounters, and revelations to encourage fellow believers</li>
                  <li><strong>Connect with Believers:</strong> Follow other members, discover nearby believers, and build spiritual connections</li>
                  <li><strong>Join Video Fellowship:</strong> Participate in live video chat rooms for prayer, worship, and Bible study</li>
                  <li><strong>Submit Prayer Requests:</strong> Share your needs and pray for others in the community</li>
                  <li><strong>Explore the Map:</strong> Find believers in your area using our interactive member map</li>
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
                    <a href="https://chosen-connect.manus.space/dashboard" style="display: inline-block; background-color: #D4AF37; color: #000000; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 18px; font-weight: bold; margin: 10px 0;">
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

export async function sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
  try {
    const htmlContent = generateWelcomeEmailTemplate(userName);
    
    await sendEmailNotification({
      to: userEmail,
      subject: "Welcome to Chosen Connect - Your Journey Begins! 🙏✨",
      htmlContent: htmlContent,
    });
    
    return true;
  } catch (error) {
    console.error("[WelcomeEmail] Failed to send welcome email:", error);
    return false;
  }
}
