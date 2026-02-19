import crypto from "crypto";

/**
 * Generate a secure random token for password reset
 */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Calculate expiration time for reset token (1 hour from now)
 */
export function getTokenExpiration(): Date {
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + 1);
  return expiration;
}

/**
 * Send password reset email (console log for development)
 * In production, replace this with actual email service
 */
export function sendPasswordResetEmail(email: string, resetToken: string, baseUrl: string): void {
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
  
  console.log("\n" + "=".repeat(80));
  console.log("📧 PASSWORD RESET EMAIL");
  console.log("=".repeat(80));
  console.log(`To: ${email}`);
  console.log(`Subject: Reset Your Password - Chosen Connect`);
  console.log("\n" + "-".repeat(80));
  console.log("Hello,\n");
  console.log("You requested to reset your password for Chosen Connect.");
  console.log("\nClick the link below to reset your password:");
  console.log(`\n${resetUrl}\n`);
  console.log("This link will expire in 1 hour.");
  console.log("\nIf you didn't request this, please ignore this email.");
  console.log("\nBlessings,");
  console.log("The Chosen Connect Team");
  console.log("-".repeat(80) + "\n");
  console.log("=".repeat(80) + "\n");
}
