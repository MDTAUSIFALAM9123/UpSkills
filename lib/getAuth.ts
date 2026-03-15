import { NextRequest } from 'next/server';
import { verifyToken, TokenPayload } from './auth';

export function getAuthFromRequest(req: NextRequest): TokenPayload | null {
  const token = req.cookies.get('token')?.value;
  if (!token) return null;
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}
