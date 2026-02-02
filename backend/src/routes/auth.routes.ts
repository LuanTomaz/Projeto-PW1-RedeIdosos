import { Router } from "express";
import { login, registerElder, registerVolunteer, registerOng, logout } from "../constrollers/auth.controller";
import { verifyToken } from "../middlewares/auth_middleware";
import { authorize } from "../middlewares/authorization.middleware";

const router = Router();

// Autenticação
router.post("/login", login);
router.post("/logout", verifyToken, logout);

// Registros (apenas para administrador)

// Registrar um idoso
router.post(
    "/register-elder",
    verifyToken, 
    authorize('admin'), 
    registerElder
);

// Registrar um voluntário
router.post(
    "/register-volunteer", 
    verifyToken,
    authorize('admin'),
    registerVolunteer
);

// Registrar uma organização (ong)
router.post(
    "/register-ong", 
    verifyToken,
    authorize('admin'), 
    registerOng
);

export default router;
