import { notifyOwner } from "./_core/notification";

export async function notifyMemberOfWeek(memberName: string, memberEmail: string) {
  // Notify the owner that a new member has been featured
  await notifyOwner({
    title: "New Member of the Week Selected",
    content: `${memberName} (${memberEmail}) has been selected as the Member of the Week.`,
  });

  // TODO: In the future, implement email sending to the member
  // For now, we'll just notify the owner
  // When email infrastructure is ready, add:
  // await sendEmail({
  //   to: memberEmail,
  //   subject: "🎉 You're Our Member of the Week!",
  //   html: getMemberOfWeekEmailTemplate(memberName),
  // });
  
  return true;
}

export function getMemberOfWeekEmailTemplate(memberName: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .highlight { background: #fef3c7; padding: 15px; border-left: 4px solid #d4af37; margin: 20px 0; }
    .cta { text-align: center; margin: 30px 0; }
    .button { display: inline-block; background: #d4af37; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Congratulations, ${memberName}!</h1>
      <p style="font-size: 18px; margin: 10px 0 0 0;">You've Been Selected as Our Member of the Week!</p>
    </div>
    <div class="content">
      <p>Dear ${memberName},</p>
      
      <p>We are thrilled to announce that you have been chosen as <strong>Chosen Connect's Member of the Week</strong>! 🌟</p>
      
      <div class="highlight">
        <strong>Why You?</strong><br>
        Your dedication to sharing your faith journey, encouraging fellow believers, and actively participating in our community has not gone unnoticed. You are making a real impact in bringing people closer to Christ.
      </div>
      
      <p>Your testimony and engagement inspire others to share their own stories and grow in their faith. This recognition is our way of saying <strong>thank you</strong> for being such a valuable part of the Chosen Connect family.</p>
      
      <p><strong>What This Means:</strong></p>
      <ul>
        <li>Your profile will be featured prominently on the Community Feed</li>
        <li>Your latest testimony will be highlighted to all members</li>
        <li>You'll inspire others to share their own faith journeys</li>
      </ul>
      
      <div class="cta">
        <a href="https://chosen-connect.manus.space/dashboard" class="button">Visit the Community Feed</a>
      </div>
      
      <p>Keep shining your light and sharing God's love with our community. We can't wait to see how you continue to impact lives for Christ!</p>
      
      <p style="margin-top: 30px;">
        <strong>Blessings,</strong><br>
        The Chosen Connect Team
      </p>
      
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      
      <p style="font-size: 12px; color: #666; text-align: center;">
        You're receiving this because you're a valued member of Chosen Connect.<br>
        <a href="https://chosen-connect.manus.space" style="color: #9333ea;">Visit Chosen Connect</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
