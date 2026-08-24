import "dotenv/config";
import express, { Request, Response } from "express";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json());

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// ── API routes (added per phase) ─────────────────────────────────────────────
// Phase 2: app.use("/api/auth",    authRouter);
// Phase 3: app.use("/api/habits",  habitsRouter);
// Phase 4: app.use("/api/habits",  checkinsRouter);

// ── Central error handler (must be last) ─────────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = Number(process.env["PORT"] ?? 4000);

app.listen(PORT, () => {
  console.log(`[server] Listening on http://localhost:${PORT}`);
});

export { app };
