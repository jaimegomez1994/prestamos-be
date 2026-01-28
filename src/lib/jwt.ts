import jwt from 'jsonwebtoken';
import type { JWTPayload } from '../types/auth.types';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload as object, JWT_SECRET, {
    expiresIn: '7d',
    issuer: 'gdprestamos',
    audience: 'gdprestamos-users',
  });
}

export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'gdprestamos',
      audience: 'gdprestamos-users',
    }) as JWTPayload;
  } catch {
    throw new Error('Token inválido o expirado');
  }
}

export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}
