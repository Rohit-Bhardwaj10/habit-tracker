import { Router } from "express";
import { register, login, refresh, getMe, updateTimezone } from "./auth.controller.js";
import { requireAuth } from "../../middleware/auth.js";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);

// Protected routes
router.get("/me", requireAuth, getMe);
router.patch("/me/timezone", requireAuth, updateTimezone);

export default router;
