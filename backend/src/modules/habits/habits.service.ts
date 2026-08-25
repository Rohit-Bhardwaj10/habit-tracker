import { prisma } from "../../config/db.js";
import { AppError } from "../../middleware/errorHandler.js";
import { computeStreaks } from "../../utils/streaks.js";
import { todayInZone, yesterdayInZone } from "../../utils/localDay.js";

export async function createHabit(userId: string, name: string, description?: string) {
  if (!name || name.trim() === "") {
    throw new AppError("Habit name is required", 400);
  }

  const habit = await prisma.habit.create({
    data: {
      name,
      description,
      ownerId: userId,
    },
  });

  return habit;
}

export async function listHabits(userId: string, userTimezone: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [habits, total] = await Promise.all([
    prisma.habit.findMany({
      where: { ownerId: userId },
      skip,
      take: limit,
      include: {
        checkIns: {
          select: { localDay: true },
          orderBy: { localDay: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.habit.count({ where: { ownerId: userId } }),
  ]);

  const today = todayInZone(userTimezone);
  const yesterday = yesterdayInZone(userTimezone);

  const enrichedHabits = habits.map((habit) => {
    const localDays = habit.checkIns.map((c) => c.localDay);
    const { currentStreak, longestStreak } = computeStreaks(localDays, today, yesterday);

    return {
      id: habit.id,
      name: habit.name,
      description: habit.description,
      createdAt: habit.createdAt,
      currentStreak,
      longestStreak,
      checkedInToday: localDays.includes(today),
      totalCheckIns: localDays.length,
    };
  });

  return {
    habits: enrichedHabits,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getHabit(habitId: string, userId: string, userTimezone: string) {
  const habit = await prisma.habit.findUnique({
    where: { id: habitId },
    include: {
      checkIns: {
        select: { localDay: true },
        orderBy: { localDay: "asc" },
      },
    },
  });

  if (!habit) {
    throw new AppError("Habit not found", 404);
  }

  if (habit.ownerId !== userId) {
    throw new AppError("Forbidden", 403);
  }

  const localDays = habit.checkIns.map((c) => c.localDay);
  const today = todayInZone(userTimezone);
  const yesterday = yesterdayInZone(userTimezone);
  const { currentStreak, longestStreak } = computeStreaks(localDays, today, yesterday);

  return {
    id: habit.id,
    name: habit.name,
    description: habit.description,
    createdAt: habit.createdAt,
    currentStreak,
    longestStreak,
    checkedInToday: localDays.includes(today),
    totalCheckIns: localDays.length,
  };
}

export async function updateHabit(habitId: string, userId: string, name?: string, description?: string) {
  const habit = await prisma.habit.findUnique({ where: { id: habitId } });
  
  if (!habit) throw new AppError("Habit not found", 404);
  if (habit.ownerId !== userId) throw new AppError("Forbidden", 403);

  const data: any = {};
  if (name !== undefined) {
    if (name.trim() === "") throw new AppError("Habit name cannot be empty", 400);
    data.name = name;
  }
  if (description !== undefined) {
    data.description = description;
  }

  const updated = await prisma.habit.update({
    where: { id: habitId },
    data,
  });

  return updated;
}

export async function deleteHabit(habitId: string, userId: string) {
  const habit = await prisma.habit.findUnique({ where: { id: habitId } });
  
  if (!habit) throw new AppError("Habit not found", 404);
  if (habit.ownerId !== userId) throw new AppError("Forbidden", 403);

  await prisma.habit.delete({ where: { id: habitId } });
  
  return { success: true };
}
