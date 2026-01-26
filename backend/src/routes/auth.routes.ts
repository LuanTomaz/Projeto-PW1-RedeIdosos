import { Router } from "express";
import { login } from "../constrollers/auth.controller";

const router = Router();

router.post("/login", login);

export default router;
