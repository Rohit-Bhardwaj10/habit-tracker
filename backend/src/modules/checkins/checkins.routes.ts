import { Router } from "express";
import { createCheckIn, listCheckIns, deleteCheckIn } from "./checkins.controller.js";
import { requireAuth } from "../../middleware/auth.js";

const router = Router({ mergeParams: true });

// All check-in routes are protected and mounted under /api/habits/:id/checkins
router.use(requireAuth);

router.post("/", createCheckIn);
router.get("/", listCheckIns);
router.delete("/:localDay", deleteCheckIn);

export default router;
