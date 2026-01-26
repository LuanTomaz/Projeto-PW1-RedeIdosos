import { Router } from "express";
import { createOng, getOngs, updateOng, deleteOng, getMyProfile, updateMyProfile, updateMyLocation } from "../constrollers/ong.controller";
import { verifyToken } from "../middlewares/auth_middleware";

const router = Router();

router.get("/me", verifyToken, getMyProfile);
router.put("/me", verifyToken, updateMyProfile);
router.put("/me/location", verifyToken, updateMyLocation);
router.get("/", verifyToken, getOngs);
router.post("/", verifyToken, createOng);
router.put("/:id", verifyToken, updateOng);
router.delete("/:id", verifyToken, deleteOng);

export default router;