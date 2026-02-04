import { Router } from "express";
import {
    getElders, 
    updateElder, 
    deleteElderController, 
    getMyProfile, 
    updateMyProfile, 
    updateMyLocation
} from "../controllers/elder.controller";
import { verifyToken } from "../middlewares/auth_middleware";
import { authorize } from "../middlewares/authorization.middleware";
import { requireActiveUser } from "../middlewares/status";

const router = Router();

// Rotas para obter o perfil do idoso autenticado
router.get(
    "/me/profile",
    verifyToken,
    authorize('idoso'),
    requireActiveUser,
    getMyProfile
);

// Rotas para atualizar o perfil e localização do idoso autenticado
router.put(
    "/me/update",
    verifyToken,
    authorize('idoso'),
    requireActiveUser,
    updateMyProfile
);

// Rota para atualizar apenas a localização do idoso autenticado
router.put(
    "/me/location",
    verifyToken,
    authorize('idoso'),
    requireActiveUser,
    updateMyLocation
);

// Rota para listar todos os idosos (acesso restrito a admins)
router.get(
    "/get-elders",
    verifyToken,
    authorize('admin', 'ong', 'voluntario', 'idoso'),
    requireActiveUser,
    getElders
);

// Rota para atualizar um idoso pelo ID
router.put(
    "/:id/update-elder",
    verifyToken,
    authorize('admin'),
    requireActiveUser,
    updateElder
);

// Rota para deletar um idoso pelo ID
router.delete(
    "/:id/delete-elder",
    verifyToken,
    authorize('admin'),
    requireActiveUser,
    deleteElderController
);

export default router;
