import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../../src/app";
import { prisma } from "../../src/config/db";

describe("Auth Module Integration Tests", () => {
  const testUser = {
    email: "test_auth@example.com",
    password: "Password123!",
    timezone: "Asia/Kolkata",
  };

  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    // Clean up test user if it exists from previous run
    await prisma.user.deleteMany({ where: { email: testUser.email } });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });
  });

  it("POST /api/auth/register — should register a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body).toHaveProperty("refreshToken");

    accessToken = res.body.accessToken;
    refreshToken = res.body.refreshToken;
  });

  it("POST /api/auth/register — should reject duplicate email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.error).toBe("Email already registered");
  });

  it("POST /api/auth/register — should reject invalid timezone", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...testUser, email: "another@example.com", timezone: "Invalid/Timezone" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid IANA timezone");
  });

  it("POST /api/auth/login — should login successfully", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: testUser.password });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body).toHaveProperty("refreshToken");
    
    // Update tokens for subsequent tests
    accessToken = res.body.accessToken;
    refreshToken = res.body.refreshToken;
  });

  it("POST /api/auth/login — should reject invalid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: "wrongpassword" });

    expect(res.status).toBe(401);
  });

  it("GET /api/auth/me — should return user profile", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(testUser.email);
    expect(res.body.timezone).toBe(testUser.timezone);
    expect(res.body).not.toHaveProperty("password");
  });

  it("GET /api/auth/me — should reject without token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("PATCH /api/auth/me/timezone — should update timezone and issue new tokens", async () => {
    const newTimezone = "America/New_York";
    const res = await request(app)
      .patch("/api/auth/me/timezone")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ timezone: newTimezone });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("accessToken");

    // Verify change took effect in DB
    const profileRes = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${res.body.accessToken}`);

    expect(profileRes.status).toBe(200);
    expect(profileRes.body.timezone).toBe(newTimezone);
  });
});
