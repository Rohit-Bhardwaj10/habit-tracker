import { Request, Response, NextFunction } from "express";
import * as authService from "./auth.service.js";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, timezone } = req.body;
    const tokens = await authService.register(email, password, timezone);
    res.status(201).json(tokens);
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const tokens = await authService.login(email, password);
    res.status(200).json(tokens);
  } catch (error) {
    next(error);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshTokens(refreshToken);
    res.status(200).json(tokens);
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user.sub;
    const profile = await authService.getUserProfile(userId);
    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
}

export async function updateTimezone(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user.sub;
    const { timezone } = req.body;
    const tokens = await authService.updateTimezone(userId, timezone);
    res.status(200).json(tokens);
  } catch (error) {
    next(error);
  }
}
