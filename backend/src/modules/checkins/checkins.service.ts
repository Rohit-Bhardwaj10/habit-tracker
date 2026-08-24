import { prisma } from "../../config/db.js";
import { AppError } from "../../middleware/errorHandler.js";
import { todayInZone, isInLocalFuture, isBeforeHabitCreation } from "../../utils/localDay.js";
import { getHabit } from "../habits/habits.service.js";

export async function createCheckIn(habitId: string, userId: string, userTimezone: string, reqLocalDay?: string) {
  // 1. Habit exists?
  const habit = await prisma.habit.findUnique({ where: { id: habitId } });
  if (!habit) throw new AppError("Habit not found", 404);

  // 2. Caller owns it?
  if (habit.ownerId !== userId) throw new AppError("Forbidden", 403);

  // 3. Resolve local day
  const localDay = reqLocalDay ?? todayInZone(userTimezone);

  // 4. Valid YYYY-MM-DD format?
  if (!/^\d{4}-\d{2}-\d{2}$/.test(localDay)) {
    throw new AppError("Invalid date format. Use YYYY-MM-DD", 400);
  }

  // 5. Not in local future?
  if (isInLocalFuture(localDay, userTimezone)) {
    throw new AppError("Cannot check in for a future date", 400);
  }

  // 6. Not before habit creation?
  if (isBeforeHabitCreation(localDay, habit.createdAt, userTimezone)) {
    throw new AppError("Cannot check in before the habit was created", 400);
  }

  // 7. Insert — DB UNIQUE constraint handles race conditions
  try {
    await prisma.checkIn.create({
      data: { habitId, checkedAt: new Date(), localDay },
    });
  } catch (e: any) {
    if (e.code === "P2002") { // Prisma unique constraint violation
      throw new AppError("Already checked in for this local day", 409);
    }
    throw e;
  }

  // Return updated habit with streaks
  return getHabit(habitId, userId, userTimezone);
}

export async function listCheckIns(habitId: string, userId: string, page = 1, limit = 20) {
  const habit = await prisma.habit.findUnique({ where: { id: habitId } });
  if (!habit) throw new AppError("Habit not found", 404);
  if (habit.ownerId !== userId) throw new AppError("Forbidden", 403);

  const skip = (page - 1) * limit;

  const [checkIns, total] = await Promise.all([
    prisma.checkIn.findMany({
      where: { habitId },
      orderBy: { localDay: "desc" },
      skip,
      take: limit,
    }),
    prisma.checkIn.count({ where: { habitId } }),
  ]);

  return {
    checkIns,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function deleteCheckIn(habitId: string, localDay: string, userId: string) {
  const habit = await prisma.habit.findUnique({ where: { id: habitId } });
  if (!habit) throw new AppError("Habit not found", 404);
  if (habit.ownerId !== userId) throw new AppError("Forbidden", 403);

  const checkIn = await prisma.checkIn.findUnique({
    where: { habitId_localDay: { habitId, localDay } },
  });

  if (!checkIn) throw new AppError("Check-in not found for this date", 404);

  await prisma.checkIn.delete({
    where: { habitId_localDay: { habitId, localDay } },
  });

  return { success: true };
}
