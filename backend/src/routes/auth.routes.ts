import { Router } from "express";
import {
    login,
    createElderProfile,
    createVolunteerProfile,
    createOngProfile,
        logout
} from "../controllers/auth.controller";
import { verifyToken } from "../middlewares/auth_middleware";
import { authorize } from "../middlewares/authorization.middleware";

const router = Router();

// Autenticação
router.post(
    "/login", 
    login
);

// Logout
router.post(
    "/logout", 
    verifyToken, 
    logout
);

// Registros (apenas para administrador)
// Registrar um idoso
router.post(
    "/profiles/elder",
    verifyToken,
    createElderProfile 
);

// Registrar um voluntário
router.post(
    "/profiles/volunteer",
    verifyToken,
    createVolunteerProfile
);

// Registrar uma organização (ong)
router.post(
    "/profiles/ong",
    verifyToken,
    createOngProfile
);

export default router;
