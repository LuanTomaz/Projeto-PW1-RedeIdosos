import { Router } from "express";
import { verifyToken } from "../middlewares/auth_middleware";
import { authorize } from "../middlewares/authorization.middleware";
import { requireActiveUser } from "../middlewares/status";
import {
    getVerifications,
    approveVerification,
    deleteVerification
} from "../controllers/verification.controller";

const router = Router();

router.get(
    "/",
    verifyToken,
    authorize("admin", "ong"),
    requireActiveUser,
    getVerifications
);

router.put(
    "/:id/approve",
    verifyToken,
    authorize("admin", "ong"),
    requireActiveUser,
    approveVerification
);

router.delete(
    "/:id",
    verifyToken,
    authorize("admin", "ong"),
    requireActiveUser,
    deleteVerification
);

export default router;
