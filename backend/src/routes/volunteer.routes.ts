import { Router } from "express";
import { createVolunteer, getVolunteers, updateVolunteer, deleteVolunteer, getMyProfile, updateMyProfile, updateMyLocation } from "../constrollers/volunteer.controller";
import { verifyToken } from "../middlewares/auth_middleware";

const router = Router();

router.get("/me", verifyToken, getMyProfile);
router.put("/me", verifyToken, updateMyProfile);
router.put("/me/location", verifyToken, updateMyLocation);
router.get("/", verifyToken, getVolunteers);
router.post("/", verifyToken, createVolunteer);
router.put("/:id", verifyToken, updateVolunteer);
router.delete("/:id", verifyToken, deleteVolunteer);

export default router;
