import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { Request, Response, NextFunction } from "express";
import { SupabaseService } from "./supabase";

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
  private static emailTransporter = nodemailer.createTransport({
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
      // Try to get user from Supabase first
      let user = await SupabaseService.getUserByEmail(email);
      
      if (!user) {
        // Create new user in Supabase
        const userId = crypto.randomUUID();
        const newUser = await SupabaseService.createUser({
          id: userId,
          email,
          subscriptionTier: "free",
          creditsRemaining: 3,
          isAdmin: false,
        });
        
        if (!newUser) {
          throw new Error("Failed to create user in database");
        }
        
        user = newUser;
      }

      // Generate magic token
      const magicToken = this.generateMagicToken();
      const expiresAt = new Date(Date.now() + MAGIC_LINK_EXPIRY * 60 * 1000);

      // Store token in Supabase
      const tokenStored = await SupabaseService.storeMagicToken(magicToken, user.id, expiresAt);
      if (!tokenStored) {
        throw new Error("Failed to store magic token");
      }

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
  ): Promise<{ success: boolean; jwt?: string; user?: any; message: string }> {
    try {
      // Get token from Supabase
      const tokenData = await SupabaseService.getMagicToken(token);
      if (!tokenData) {
        return { success: false, message: "Invalid or expired magic link." };
      }

      // Check if token has expired
      if (new Date(tokenData.expires_at) < new Date()) {
        // Clean up expired token
        await SupabaseService.deleteMagicToken(token);
        return {
          success: false,
          message: "Magic link has expired. Please request a new one.",
        };
      }

      // Get user from Supabase
      const user = await SupabaseService.getUserById(tokenData.user_id);
      if (!user) {
        return { success: false, message: "User not found." };
      }

      // Mark email as verified and clear magic token
      await SupabaseService.updateUser(user.id, { email_verified: true });
      await SupabaseService.deleteMagicToken(token);

      // Generate JWT
      const jwtToken = this.generateJWT(user.id);

      return {
        success: true,
        jwt: jwtToken,
        user: { ...user },
        message: "Successfully signed in!",
      };
    } catch (error) {
      console.error("Error verifying magic token:", error);
      return { success: false, message: "Failed to verify magic link. Please try again." };
    }
  }

  /**
   * Get user by ID
   */
  static async getUser(userId: string): Promise<any | null> {
    return await SupabaseService.getUserById(userId);
  }

  /**
   * Update user subscription
   */
  static async updateUserSubscription(
    userId: string,
    tier: "free" | "pro",
    credits?: number,
  ): Promise<boolean> {
    try {
      const updates: any = { subscription_tier: tier };
      
      if (credits !== undefined) {
        updates.credits_remaining = credits;
      } else if (tier === "pro") {
        updates.credits_remaining = 100; // Pro users get 100 credits
      }

      const result = await SupabaseService.updateUser(userId, updates);
      return result !== null;
    } catch (error) {
      console.error('Error updating user subscription:', error);
      return false;
    }
  }

  /**
   * Check and consume user credits
   */
  static async checkAndConsumeCredits(
    userId: string,
    amount: number = 1,
  ): Promise<{ allowed: boolean; remaining: number }> {
    try {
      const user = await SupabaseService.getUserById(userId);
      if (!user) {
        return { allowed: false, remaining: 0 };
      }

      // Reset credits if 24 hours have passed
      if (new Date(user.credits_reset_date) < new Date()) {
        const newCredits = user.subscription_tier === "pro" ? 100 : 3;
        const newResetDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
        
        await SupabaseService.updateUser(userId, {
          credits_remaining: newCredits,
          credits_reset_date: newResetDate.toISOString()
        });
        
        user.credits_remaining = newCredits;
        user.credits_reset_date = newResetDate.toISOString();
      }

      if (user.credits_remaining < amount) {
        return { allowed: false, remaining: user.credits_remaining };
      }

      // Consume credits
      const newCredits = user.credits_remaining - amount;
      await SupabaseService.updateUser(userId, { credits_remaining: newCredits });
      
      return { allowed: true, remaining: newCredits };
    } catch (error) {
      console.error('Error checking/consuming credits:', error);
      return { allowed: false, remaining: 0 };
    }
  }
}

/**
 * Express middleware for JWT authentication
 */
export const authenticateJWT = async (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: "Access token required" });
    }

    const userId = AuthService.verifyJWT(token);
    if (!userId) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    const user = await AuthService.getUser(userId);
    if (!user) {
      return res.status(403).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: "Authentication failed" });
  }
 };

/**
 * Express middleware for optional JWT authentication
 */
export const optionalAuth = async (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      const userId = AuthService.verifyJWT(token);
      if (userId) {
        const user = await AuthService.getUser(userId);
        if (user) {
          req.user = user;
        }
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next(); // Continue without authentication
  }
};

/**
 * Express middleware for admin authentication
 */
export const authenticateAdmin = async (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction,
) => {
  try {
    await authenticateJWT(req, res, () => {
      if (!req.user?.is_admin) {
        return res.status(403).json({ error: "Admin access required" });
      }
      next();
    });
  } catch (error) {
    console.error('Admin authentication error:', error);
    return res.status(500).json({ error: "Admin authentication failed" });
  }
};
