import { Router } from "express";
import { createElder, getElders, updateElder, deleteElder, getMyProfile, updateMyProfile, updateMyLocation } from "../constrollers/elder.controller";
import { verifyToken } from "../middlewares/auth_middleware";
import { authorize, authorizeRole } from "../middlewares/authorization.middleware";

const router = Router();

router.get(
    "/me",
    verifyToken,
    getMyProfile
);
router.put(
    "/me",
    verifyToken,
    updateMyProfile
);
router.put(
    "/me/location",
    verifyToken,
    updateMyLocation
);
router.get(
    "/",
    verifyToken,
    authorize('admin'),
    getElders
);
router.post(
    "/",
    verifyToken,
    createElder
);
router.put(
    "/:id",
    verifyToken,
    updateElder
);
router.delete(
    "/:id",
    verifyToken,
    deleteElder
);

export default router;
