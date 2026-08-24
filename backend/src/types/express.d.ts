import "jsonwebtoken";

/**
 * JWT access-token payload embedded in every protected request.
 * Stored on `req.user` after verification by `requireAuth` middleware.
 */
export interface TokenPayload {
  /** User UUID (the `sub` claim). */
  sub: string;
  email: string;
  /** IANA timezone string, e.g. "Asia/Kolkata". Embedded to avoid extra DB hits. */
  timezone: string;
  /** Issued-at (seconds). */
  iat?: number;
  /** Expiry (seconds). */
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user: TokenPayload;
    }
  }
}
