import { Router } from "express";
import { verifyToken } from "../middlewares/auth_middleware";
import { authorize } from "../middlewares/authorization.middleware";
import { requireActiveUser } from "../middlewares/status";
import {
    getCompanionshipsMap,
    getEldersMap,
    getVolunteersMap,
    getCompanionshipsNearby,
    getMyCompanionshipsMap
} from "../controllers/map.controller";

const router = Router();

router.get(
    "/companionships",
    verifyToken,
    authorize("admin", "ong"),
    requireActiveUser,
    getCompanionshipsMap
);

router.get(
    "/elders",
    verifyToken,
    authorize("admin", "ong"),
    requireActiveUser,
    getEldersMap
);

router.get(
    "/volunteers",
    verifyToken,
    authorize("admin", "ong"),
    requireActiveUser,
    getVolunteersMap
);

router.get(
    "/companionships/nearby",
    verifyToken,
    authorize("voluntario"),
    requireActiveUser,
    getCompanionshipsNearby
);

router.get(
    "/companionships/me",
    verifyToken,
    authorize("idoso", "voluntario"),
    requireActiveUser,
    getMyCompanionshipsMap
);

export default router;
