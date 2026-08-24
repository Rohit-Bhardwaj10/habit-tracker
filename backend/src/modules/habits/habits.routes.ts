import { Router } from "express";
import { createHabit, listHabits, getHabit, updateHabit, deleteHabit } from "./habits.controller.js";
import { requireAuth } from "../../middleware/auth.js";

const router = Router();

// All habit routes are protected
router.use(requireAuth);

router.post("/", createHabit);
router.get("/", listHabits);
router.get("/:id", getHabit);
router.patch("/:id", updateHabit);
router.delete("/:id", deleteHabit);

export default router;
