import { Router } from "express";
import { createElder, getElders, updateElder, deleteElder } from "../constrollers/elder.controller";
import { verifyToken } from "../middlewares/auth_middleware";

const router = Router();

router.get("/", verifyToken, getElders);
router.post("/", verifyToken, createElder);
router.put("/:id", verifyToken, updateElder);
router.delete("/:id", verifyToken, deleteElder);

export default router;
