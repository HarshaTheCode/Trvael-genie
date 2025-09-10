import { Request, Response } from 'express';
import { SupabaseService } from '../services/supabase';
import { AuthService } from '../services/auth';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret';

export const sendMagicLink = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const result = await AuthService.sendMagicLink(email);
    if (result.success) {
      res.status(200).json({ message: result.message });
    } else {
      res.status(500).json({ error: result.message });
    }
  } catch (error) {
    console.error('Error sending magic link:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const verifyMagicLink = async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    const magicToken = await SupabaseService.getMagicToken(token);
    if (!magicToken || new Date(magicToken.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    await SupabaseService.deleteMagicToken(token);

    // Here you would typically generate a JWT and send it to the client
    res.status(200).json({ message: 'Login successful', userId: magicToken.user_id });
  } catch (error) {
    console.error('Error verifying magic link:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  // This route is protected by authenticateJWT middleware
  // The user object is attached to the request
  res.status(200).json({ user: (req as any).user });
};

export const logout = (req: Request, res: Response) => {
  // On the client-side, the token should be deleted.
  // Server-side stateless logout.
  res.status(200).json({ message: 'Logged out successfully' });
};

export const refreshToken = (req: Request, res: Response) => {
  // This is a placeholder. In a real app, you would issue a new JWT.
  res.status(200).json({ message: 'Token refreshed' });
};

export const signup = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);

    const newUser = await SupabaseService.createUser({ email, password_hash });

    if (!newUser) {
        return res.status(500).json({ error: 'Failed to create user' });
    }

    res.status(201).json({ message: 'User created successfully' });
  } catch (error: any) {
    if (error?.code === '23505') { // Unique violation
        return res.status(409).json({ error: 'User with this email already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await SupabaseService.getUserByEmail(email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.password_hash) {
        return res.status(401).json({ error: 'Password not set for this user' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};