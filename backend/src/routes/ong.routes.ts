import { Router } from "express";
import { createOng, getOngs, updateOng, deleteOng } from "../constrollers/ong.controller";
import { verifyToken } from "../middlewares/auth_middleware";

const router = Router();

router.get("/", verifyToken, getOngs);
router.post("/", verifyToken, createOng);
router.put("/:id", verifyToken, updateOng);
router.delete("/:id", verifyToken, deleteOng);

export default router;
