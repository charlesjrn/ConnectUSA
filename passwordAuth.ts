import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ENV } from "./env";

const SALT_ROUNDS = 10;

/**
 * Hash a plain text password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a plain text password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token for email/password authenticated users
 */
export function generateAuthToken(userId: number, email: string): string {
  return jwt.sign(
    { userId, email, loginMethod: "email" },
    ENV.cookieSecret,
    { expiresIn: "30d" }
  );
}

/**
 * Verify and decode a JWT token
 */
export function verifyAuthToken(token: string): {
  userId: number;
  email: string;
  loginMethod: string;
} | null {
  try {
    const decoded = jwt.verify(token, ENV.cookieSecret) as {
      userId: number;
      email: string;
      loginMethod: string;
    };
    return decoded;
  } catch {
    return null;
  }
}
