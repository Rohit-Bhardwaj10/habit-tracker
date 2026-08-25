import dotenv from "dotenv";
dotenv.config({ override: true });

import express, { Request, Response } from "express";
import { errorHandler } from "./middleware/errorHandler.js";
import authRouter from "./modules/auth/auth.routes.js";
import habitsRouter from "./modules/habits/habits.routes.js";

import cors from "cors";

const app = express();

const frontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, "") : "*";
app.use(cors({
  origin: frontendUrl,
  credentials: true
}));

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json());

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// ── API routes ────────────────────────────────────────────────────────────────

import checkinsRouter from "./modules/checkins/checkins.routes.js";

app.use("/api/auth", authRouter);
app.use("/api/habits", habitsRouter);
app.use("/api/habits/:id/checkins", checkinsRouter);

// ── Central error handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

// NOTE: app.listen() is intentionally NOT called here.
// The server is started in server.ts so test files can import `app`
// without binding a port — avoiding EADDRINUSE when multiple test
// modules are loaded in the same Vitest worker process.
export { app };
