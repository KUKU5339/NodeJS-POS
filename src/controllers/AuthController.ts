import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export async function register(req: Request, res: Response) {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) return res.status(422).json({ message: 'invalid' });
  const exists = await User.findOne({ where: { email } });
  if (exists) return res.status(409).json({ message: 'exists' });
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hash });
  return res.json({ id: user.id });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body || {};
  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(401).json({ message: 'invalid' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: 'invalid' });
  const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({ token });
}
