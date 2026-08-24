import { Request, Response, NextFunction } from "express";

// ── AppError ──────────────────────────────────────────────────────────────────

/**
 * Typed application error.
 * Thrown anywhere in the service/controller layer;
 * caught by `errorHandler` and serialised to JSON.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.isOperational = true;
    // Restore prototype chain (required when extending built-ins in TypeScript)
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// ── Central error handler ─────────────────────────────────────────────────────

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // `next` must be declared even if unused — Express identifies 4-arg middleware
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Unexpected / unhandled errors
  const message =
    process.env["NODE_ENV"] === "production"
      ? "Internal server error"
      : err instanceof Error
        ? err.message
        : "Unknown error";

  console.error("[unhandled error]", err);
  res.status(500).json({ error: message });
}
