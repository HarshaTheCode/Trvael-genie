import { RequestHandler } from 'express';
import { AuthService } from '../services/auth';

interface AuthRequest {
  email: string;
}

interface VerifyRequest {
  token: string;
}

export const sendMagicLink: RequestHandler = async (req, res) => {
  try {
    const { email }: AuthRequest = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Valid email address is required'
      });
    }

    const result = await AuthService.sendMagicLink(email);
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Send magic link error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const verifyMagicLink: RequestHandler = async (req, res) => {
  try {
    const { token }: VerifyRequest = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    const result = await AuthService.verifyMagicToken(token);
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        token: result.jwt,
        user: {
          id: result.user?.id,
          email: result.user?.email,
          subscriptionTier: result.user?.subscriptionTier,
          creditsRemaining: result.user?.creditsRemaining,
          isAdmin: result.user?.isAdmin
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Verify magic link error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getCurrentUser: RequestHandler = async (req: any, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    res.json({
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        subscriptionTier: req.user.subscriptionTier,
        creditsRemaining: req.user.creditsRemaining,
        isAdmin: req.user.isAdmin,
        emailVerified: req.user.emailVerified
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const logout: RequestHandler = async (req, res) => {
  // For JWT-based auth, logout is mainly client-side (removing token)
  // But we can track logout events for analytics
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

export const refreshToken: RequestHandler = async (req: any, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    // Generate new JWT token
    const newToken = AuthService.generateJWT(req.user.id);

    res.json({
      success: true,
      token: newToken,
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
