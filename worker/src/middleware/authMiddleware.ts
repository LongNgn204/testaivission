/**
 * ========================================
 * AUTHENTICATION MIDDLEWARE
 * ========================================
 * JWT verification middleware cho Cloudflare Worker
 */

import { AuthenticationError } from '../../../utils/errors';

export interface AuthContext {
  userId: string;
  token: string;
  issuedAt: number;
  expiresAt: number;
}

/**
 * Verify JWT token (simple implementation)
 * Trong production, nên dùng proper JWT library
 */
export function verifyJWT(token: string, secret: string): AuthContext {
  try {
    // Remove "Bearer " prefix if present
    const cleanToken = token.replace(/^Bearer\s+/i, '');

    // Simple JWT verification (in production, use proper library)
    const parts = cleanToken.split('.');
    if (parts.length !== 3) {
      throw new AuthenticationError('Invalid token format');
    }

    // Decode payload (không verify signature ở đây - chỉ demo)
    const payload = JSON.parse(atob(parts[1]));

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new AuthenticationError('Token expired');
    }

    return {
      userId: payload.sub || payload.userId,
      token: cleanToken,
      issuedAt: payload.iat || now,
      expiresAt: payload.exp || now + 86400,
    };
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    throw new AuthenticationError('Invalid token');
  }
}

/**
 * Extract token from request
 */
export function extractToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader) {
    return null;
  }

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

/**
 * Authentication middleware
 */
export function authMiddleware(secret: string) {
  return (request: Request): AuthContext => {
    const token = extractToken(request);

    if (!token) {
      throw new AuthenticationError('Missing authentication token');
    }

    return verifyJWT(token, secret);
  };
}

/**
 * Optional authentication middleware
 * Không throw error nếu token missing, tapi verify nếu ada
 */
export function optionalAuthMiddleware(secret: string) {
  return (request: Request): AuthContext | null => {
    const token = extractToken(request);

    if (!token) {
      return null;
    }

    try {
      return verifyJWT(token, secret);
    } catch (error) {
      // Log error but don't throw
      console.warn('Token verification failed:', error);
      return null;
    }
  };
}

