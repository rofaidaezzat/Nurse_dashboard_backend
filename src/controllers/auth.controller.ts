import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';

// ─── Helper: Generate JWT ────────────────────────────────────────────────────
const signToken = (id: string): string =>
  jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '100000000d') as any,
  });


// ─── POST /api/v1/auth/login ─────────────────────────────────────────────────
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, message: 'Email and password are required' });
    return;
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    res.status(401).json({ success: false, message: 'Invalid email or password' });
    return;
  }

  const token = signToken(user._id.toString());
  (user as any).password = undefined;

  res.status(200).json({ success: true, token, data: user });
};

// ─── GET /api/v1/auth/me ─────────────────────────────────────────────────────
export const getMe = async (req: Request, res: Response): Promise<void> => {
  const user = await User.findById((req as any).user.id);
  res.status(200).json({ success: true, data: user });
};
