import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export function auth(req: Request, res: Response, next: NextFunction) {
  const h = req.headers.authorization || '';
  const parts = h.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ message: 'unauthorized' });
  try {
    const payload = jwt.verify(parts[1], JWT_SECRET) as any;
    (req as any).userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ message: 'unauthorized' });
  }
}
