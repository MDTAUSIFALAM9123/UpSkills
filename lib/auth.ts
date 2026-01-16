import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export interface TokenPayload {
  id: string;
  role: string;
  exp: number;
  iat: number;
}

// Generate JWT (SERVER ONLY)

export function generateToken(user: { id: string; role: string }) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

// Verify JWT (SERVER ONLY – SECURE)

export function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}
