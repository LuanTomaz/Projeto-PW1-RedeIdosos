import { Router } from "express";
import { createCompanionship, getCompanionships, updateCompanionship, deleteCompanionship } from "../constrollers/companionship.controller";
import { verifyToken } from "../middlewares/auth_middleware";

const router = Router();

router.get("/", verifyToken, getCompanionships);
router.post("/", verifyToken, createCompanionship);
router.put("/:id", verifyToken, updateCompanionship);
router.delete("/:id", verifyToken, deleteCompanionship);

export default router;
