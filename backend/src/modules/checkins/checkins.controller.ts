import { Request, Response, NextFunction } from "express";
import * as checkinsService from "./checkins.service.js";

type IdParam = { id: string };
type IdAndDayParam = { id: string; localDay: string };

export async function createCheckIn(req: Request<IdParam>, res: Response, next: NextFunction) {
  try {
    const userId = req.user.sub;
    const userTimezone = req.user.timezone;
    const { id } = req.params;
    const { localDay } = req.body;

    const data = await checkinsService.createCheckIn(id, userId, userTimezone, localDay);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
}

export async function listCheckIns(req: Request<IdParam>, res: Response, next: NextFunction) {
  try {
    const userId = req.user.sub;
    const { id } = req.params;
    const page = typeof req.query.page === "string" ? parseInt(req.query.page, 10) : 1;
    const limit = typeof req.query.limit === "string" ? parseInt(req.query.limit, 10) : 20;

    const data = await checkinsService.listCheckIns(id, userId, page, limit);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

export async function deleteCheckIn(req: Request<IdAndDayParam>, res: Response, next: NextFunction) {
  try {
    const userId = req.user.sub;
    const { id, localDay } = req.params;

    await checkinsService.deleteCheckIn(id, localDay, userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
