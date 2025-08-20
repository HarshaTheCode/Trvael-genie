import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
const MAGIC_LINK_EXPIRY = 15; // minutes

// In-memory user storage for development (replace with database)
interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  magicToken?: string;
  magicTokenExpires?: Date;
  subscriptionTier: "free" | "pro";
  creditsRemaining: number;
  creditsResetDate: Date;
  isAdmin: boolean;
  createdAt: Date;
}

const users = new Map<string, User>();
const usersByEmail = new Map<string, User>();
const magicTokens = new Map<string, string>(); // token -> userId

export class AuthService {
  private static emailTransporter = nodemailer.createTransporter({
    // Configure your email service here
    service: "gmail", // or your preferred service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  /**
   * Generate JWT token for authenticated user
   */
  static generateJWT(userId: string): string {
    return jwt.sign(
      { userId, iat: Math.floor(Date.now() / 1000) },
      JWT_SECRET,
      { expiresIn: "7d" },
    );
  }

  /**
   * Verify JWT token and return user ID
   */
  static verifyJWT(token: string): string | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      return decoded.userId;
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate secure magic link token
   */
  static generateMagicToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Send magic link email
   */
  static async sendMagicLink(
    email: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Generate or get user
      let user = usersByEmail.get(email);
      if (!user) {
        // Create new user
        const userId = crypto.randomUUID();
        user = {
          id: userId,
          email,
          emailVerified: false,
          subscriptionTier: "free",
          creditsRemaining: 3,
          creditsResetDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          isAdmin: false,
          createdAt: new Date(),
        };
        users.set(userId, user);
        usersByEmail.set(email, user);
      }

      // Generate magic token
      const magicToken = this.generateMagicToken();
      const expiresAt = new Date(Date.now() + MAGIC_LINK_EXPIRY * 60 * 1000);

      // Store token
      user.magicToken = magicToken;
      user.magicTokenExpires = expiresAt;
      magicTokens.set(magicToken, user.id);

      // Create magic link
      const magicLink = `${process.env.FRONTEND_URL || "http://localhost:8080"}/auth/verify?token=${magicToken}`;

      // Send email
      await this.emailTransporter.sendMail({
        from: process.env.EMAIL_FROM || "noreply@travelgenie.com",
        to: email,
        subject: "Your TravelGenie Login Link",
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h2 style="color: #ea580c;">Welcome to TravelGenie!</h2>
            <p>Click the link below to sign in to your account:</p>
            <a href="${magicLink}" 
               style="display: inline-block; background: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
              Sign In to TravelGenie
            </a>
            <p style="color: #666; font-size: 14px;">
              This link will expire in ${MAGIC_LINK_EXPIRY} minutes. If you didn't request this, you can safely ignore this email.
            </p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px;">
              TravelGenie - AI-Powered Travel Planning for India
            </p>
          </div>
        `,
      });

      return { success: true, message: "Magic link sent to your email!" };
    } catch (error) {
      console.error("Failed to send magic link:", error);
      return {
        success: false,
        message: "Failed to send magic link. Please try again.",
      };
    }
  }

  /**
   * Verify magic token and return JWT
   */
  static async verifyMagicToken(
    token: string,
  ): Promise<{ success: boolean; jwt?: string; user?: User; message: string }> {
    const userId = magicTokens.get(token);
    if (!userId) {
      return { success: false, message: "Invalid or expired magic link." };
    }

    const user = users.get(userId);
    if (!user || !user.magicToken || user.magicToken !== token) {
      return { success: false, message: "Invalid magic link." };
    }

    if (!user.magicTokenExpires || user.magicTokenExpires < new Date()) {
      return {
        success: false,
        message: "Magic link has expired. Please request a new one.",
      };
    }

    // Mark email as verified and clear magic token
    user.emailVerified = true;
    user.magicToken = undefined;
    user.magicTokenExpires = undefined;
    magicTokens.delete(token);

    // Generate JWT
    const jwtToken = this.generateJWT(userId);

    return {
      success: true,
      jwt: jwtToken,
      user: { ...user },
      message: "Successfully signed in!",
    };
  }

  /**
   * Get user by ID
   */
  static getUser(userId: string): User | null {
    return users.get(userId) || null;
  }

  /**
   * Update user subscription
   */
  static updateUserSubscription(
    userId: string,
    tier: "free" | "pro",
    credits?: number,
  ): boolean {
    const user = users.get(userId);
    if (!user) return false;

    user.subscriptionTier = tier;
    if (credits !== undefined) {
      user.creditsRemaining = credits;
    }

    // Pro users get more credits
    if (tier === "pro" && credits === undefined) {
      user.creditsRemaining = 100; // Pro users get 100 credits
    }

    return true;
  }

  /**
   * Check and consume user credits
   */
  static checkAndConsumeCredits(
    userId: string,
    amount: number = 1,
  ): { allowed: boolean; remaining: number } {
    const user = users.get(userId);
    if (!user) {
      return { allowed: false, remaining: 0 };
    }

    // Reset credits if 24 hours have passed
    if (user.creditsResetDate < new Date()) {
      user.creditsRemaining = user.subscriptionTier === "pro" ? 100 : 3;
      user.creditsResetDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    if (user.creditsRemaining < amount) {
      return { allowed: false, remaining: user.creditsRemaining };
    }

    user.creditsRemaining -= amount;
    return { allowed: true, remaining: user.creditsRemaining };
  }
}

/**
 * Express middleware for JWT authentication
 */
export const authenticateJWT = (
  req: Request & { user?: User },
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  const userId = AuthService.verifyJWT(token);
  if (!userId) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }

  const user = AuthService.getUser(userId);
  if (!user) {
    return res.status(403).json({ error: "User not found" });
  }

  req.user = user;
  next();
};

/**
 * Express middleware for optional JWT authentication
 */
export const optionalAuth = (
  req: Request & { user?: User },
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (token) {
    const userId = AuthService.verifyJWT(token);
    if (userId) {
      const user = AuthService.getUser(userId);
      if (user) {
        req.user = user;
      }
    }
  }

  next();
};

/**
 * Express middleware for admin authentication
 */
export const authenticateAdmin = (
  req: Request & { user?: User },
  res: Response,
  next: NextFunction,
) => {
  authenticateJWT(req, res, () => {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  });
};
