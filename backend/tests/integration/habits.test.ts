import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../../src/app";
import { prisma } from "../../src/config/db";

describe("Habits Module Integration Tests", () => {
  const testUser = {
    email: "test_habits@example.com",
    password: "Password123!",
    timezone: "Asia/Kolkata",
  };

  let accessToken: string;
  let userId: string;
  let habitId: string;

  beforeAll(async () => {
    // Clean up
    await prisma.user.deleteMany({ where: { email: testUser.email } });

    // Register user
    const res = await request(app).post("/api/auth/register").send(testUser);
    accessToken = res.body.accessToken;

    // Fetch user ID for assertions
    const userProfile = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);
    userId = userProfile.body.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });
  });

  it("POST /api/habits — should create a habit", async () => {
    const res = await request(app)
      .post("/api/habits")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "Drink Water", description: "3 liters daily" });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Drink Water");
    expect(res.body.ownerId).toBe(userId);

    habitId = res.body.id;
  });

  it("POST /api/habits — should reject empty name", async () => {
    const res = await request(app)
      .post("/api/habits")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Habit name is required");
  });

  it("GET /api/habits — should list habits with streak details", async () => {
    const res = await request(app)
      .get("/api/habits")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.habits).toBeInstanceOf(Array);
    expect(res.body.habits.length).toBe(1);

    const habit = res.body.habits[0];
    expect(habit.name).toBe("Drink Water");
    expect(habit.currentStreak).toBe(0);
    expect(habit.longestStreak).toBe(0);
    expect(habit.checkedInToday).toBe(false);
    expect(habit.totalCheckIns).toBe(0);
    
    expect(res.body.pagination.total).toBe(1);
  });

  it("GET /api/habits/:id — should return single habit", async () => {
    const res = await request(app)
      .get(`/api/habits/${habitId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(habitId);
    expect(res.body.name).toBe("Drink Water");
  });

  it("PATCH /api/habits/:id — should update habit details", async () => {
    const res = await request(app)
      .patch(`/api/habits/${habitId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "Drink More Water" });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Drink More Water");
  });

  it("DELETE /api/habits/:id — should delete habit", async () => {
    const res = await request(app)
      .delete(`/api/habits/${habitId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(204);

    // Verify deletion
    const verifyRes = await request(app)
      .get(`/api/habits/${habitId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(verifyRes.status).toBe(404);
  });
});
