import { Router } from "express";
import { createCompanionship, getCompanionships, updateCompanionship, deleteCompanionship, acceptCompanionship, completeCompanionship, updateCompanionshipStatus, getCompanionshipsByUser } from "../constrollers/companionship.controller";
import { verifyToken } from "../middlewares/auth_middleware";

const router = Router();

router.get("/", verifyToken, getCompanionships);
router.get("/me", verifyToken, getCompanionshipsByUser);
router.post("/", verifyToken, createCompanionship);
router.post("/:id/accept", verifyToken, acceptCompanionship);
router.put("/:id", verifyToken, updateCompanionship);
router.put("/:id/status", verifyToken, updateCompanionshipStatus);
router.put("/:id/complete", verifyToken, completeCompanionship);
router.delete("/:id", verifyToken, deleteCompanionship);

export default router;
