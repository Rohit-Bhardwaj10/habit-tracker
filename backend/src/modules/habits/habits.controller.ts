import { Request, Response, NextFunction } from "express";
import * as habitsService from "./habits.service.js";

// Narrow the :id route param to a plain string
type IdParam = { id: string };

export async function createHabit(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user.sub;
    const { name, description } = req.body;

    const habit = await habitsService.createHabit(userId, name, description);
    res.status(201).json(habit);
  } catch (error) {
    next(error);
  }
}

export async function listHabits(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user.sub;
    const userTimezone = req.user.timezone;
    const page = typeof req.query.page === "string" ? parseInt(req.query.page, 10) : 1;
    const limit = typeof req.query.limit === "string" ? parseInt(req.query.limit, 10) : 20;

    const data = await habitsService.listHabits(userId, userTimezone, page, limit);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

export async function getHabit(req: Request<IdParam>, res: Response, next: NextFunction) {
  try {
    const userId = req.user.sub;
    const userTimezone = req.user.timezone;
    const { id } = req.params;

    const data = await habitsService.getHabit(id, userId, userTimezone);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

export async function updateHabit(req: Request<IdParam>, res: Response, next: NextFunction) {
  try {
    const userId = req.user.sub;
    const { id } = req.params;
    const { name, description } = req.body;

    const updated = await habitsService.updateHabit(id, userId, name, description);
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
}

export async function deleteHabit(req: Request<IdParam>, res: Response, next: NextFunction) {
  try {
    const userId = req.user.sub;
    const { id } = req.params;

    await habitsService.deleteHabit(id, userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
