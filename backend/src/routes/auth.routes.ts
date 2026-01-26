import { Router } from "express";
import { login, registerElder, registerVolunteer, registerOng, logout } from "../constrollers/auth.controller";
import { verifyToken } from "../middlewares/auth_middleware";

const router = Router();

// Autenticação
router.post("/login", login);
router.post("/logout", verifyToken, logout);

// Registros
router.post("/register/elder", registerElder);
router.post("/register/volunteer", registerVolunteer);
router.post("/register/ong", registerOng);
export default router;
