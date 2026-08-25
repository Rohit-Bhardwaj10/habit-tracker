import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/db.js";
import { AppError } from "../../middleware/errorHandler.js";
import { isValidIANATimezone } from "../../utils/localDay.js";
import { TokenPayload } from "../../types/express.js";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "15m";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN ?? "7d";

function generateTokens(user: { id: string; email: string; timezone: string }) {
  const payload: TokenPayload = {
    sub: user.id,
    email: user.email,
    timezone: user.timezone,
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] });
  const refreshToken = jwt.sign({ sub: user.id }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"] });

  return { accessToken, refreshToken };
}

export async function register(email: string, password: string, timezone: string) {
  if (!isValidIANATimezone(timezone)) {
    throw new AppError("Invalid IANA timezone", 400);
  }
  if (password.length < 8) {
    throw new AppError("Password must be at least 8 characters", 400);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError("Email already registered", 409);
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, password: hashed, timezone },
  });

  return generateTokens(user);
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new AppError("Invalid email or password", 401);
  }

  return generateTokens(user);
}

export async function refreshTokens(refreshToken: string) {
  try {
    const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { sub: string };
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    
    if (!user) {
      throw new AppError("User no longer exists", 401);
    }

    return generateTokens(user);
  } catch (error) {
    throw new AppError("Invalid or expired refresh token", 401);
  }
}

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, timezone: true, createdAt: true },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
}

export async function updateTimezone(userId: string, timezone: string) {
  if (!isValidIANATimezone(timezone)) {
    throw new AppError("Invalid IANA timezone", 400);
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { timezone },
  });

  // Return new tokens so the client's JWT payload reflects the new timezone
  return generateTokens(user);
}
