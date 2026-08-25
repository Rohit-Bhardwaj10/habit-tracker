import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../../src/app";
import { prisma } from "../../src/config/db";
import { todayInZone, yesterdayInZone } from "../../src/utils/localDay";
import { DateTime } from "luxon";

describe("Check-ins Module Integration Tests", () => {
  const testUser = {
    email: "test_checkins@example.com",
    password: "Password123!",
    timezone: "Asia/Kolkata",
  };

  let accessToken: string;
  let userId: string;
  let habitId: string;
  let today: string;
  let yesterday: string;

  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });

    // Register user
    const res = await request(app).post("/api/auth/register").send(testUser);
    accessToken = res.body.accessToken;

    const userProfile = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);
    userId = userProfile.body.id;

    today = todayInZone(testUser.timezone);
    yesterday = yesterdayInZone(testUser.timezone);

    // Create a habit for check-in tests, explicitly setting createdAt to past
    // so we can test backfilling (otherwise we can't backfill before today).
    const habit = await prisma.habit.create({
      data: {
        name: "Morning Run",
        ownerId: userId,
        createdAt: DateTime.now().setZone(testUser.timezone).minus({ days: 10 }).toJSDate(),
      },
    });
    habitId = habit.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });
  });

  it("POST /api/habits/:id/checkins — should check in for today", async () => {
    const res = await request(app)
      .post(`/api/habits/${habitId}/checkins`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({}); // localDay omitted defaults to today

    expect(res.status).toBe(201);
    expect(res.body.checkedInToday).toBe(true);
    expect(res.body.currentStreak).toBe(1);
    expect(res.body.totalCheckIns).toBe(1);
  });

  it("POST /api/habits/:id/checkins — should reject duplicate check-in (409)", async () => {
    const res = await request(app)
      .post(`/api/habits/${habitId}/checkins`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ localDay: today });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe("Already checked in for this local day");
  });

  it("POST /api/habits/:id/checkins — should reject future check-ins (400)", async () => {
    const tomorrow = DateTime.now().setZone(testUser.timezone).plus({ days: 1 }).toISODate();
    
    const res = await request(app)
      .post(`/api/habits/${habitId}/checkins`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ localDay: tomorrow });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Cannot check in for a future date");
  });

  it("POST /api/habits/:id/checkins — should backfill and increase streak", async () => {
    const res = await request(app)
      .post(`/api/habits/${habitId}/checkins`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ localDay: yesterday });

    expect(res.status).toBe(201);
    expect(res.body.currentStreak).toBe(2); // yesterday + today
    expect(res.body.longestStreak).toBe(2);
    expect(res.body.totalCheckIns).toBe(2);
  });

  it("GET /api/habits/:id/checkins — should list check-ins", async () => {
    const res = await request(app)
      .get(`/api/habits/${habitId}/checkins`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.checkIns).toHaveLength(2);
    // ordered by localDay desc
    expect(res.body.checkIns[0].localDay).toBe(today);
    expect(res.body.checkIns[1].localDay).toBe(yesterday);
  });

  it("DELETE /api/habits/:id/checkins/:localDay — should delete check-in", async () => {
    // Delete today's check-in
    const res = await request(app)
      .delete(`/api/habits/${habitId}/checkins/${today}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(204);

    // Verify streak drops back to 0 (since yesterday was the last one)
    // Actually, if yesterday is the last checkin, current streak is 1. Let's verify:
    const verifyRes = await request(app)
      .get(`/api/habits/${habitId}`)
      .set("Authorization", `Bearer ${accessToken}`);
      
    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.checkedInToday).toBe(false);
    expect(verifyRes.body.currentStreak).toBe(1); // yesterday
    expect(verifyRes.body.totalCheckIns).toBe(1);
  });
});
