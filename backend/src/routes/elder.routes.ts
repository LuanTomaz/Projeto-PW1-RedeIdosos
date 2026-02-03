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

const router = Router();

// Rotas para obter o perfil do idoso autenticado
router.get(
    "/me/profile",
    verifyToken,
    authorize('idoso'),
    getMyProfile
);

// Rotas para atualizar o perfil e localização do idoso autenticado
router.put(
    "/me/update",
    verifyToken,
    authorize('idoso'),
    updateMyProfile
);

// Rota para atualizar apenas a localização do idoso autenticado
router.put(
    "/me/location",
    verifyToken,
    authorize('idoso'),
    updateMyLocation
);

// Rota para listar todos os idosos (acesso restrito a admins)
router.get(
    "/get-elders",
    verifyToken,
    authorize('admin'),
    getElders
);
// Por enquanto, criação de idoso é feita via auth.controller, e um idoso não pode criar outro idoso.
// router.post(
//     "/",
//     verifyToken,
//     createElder
// );

// Rota para atualizar um idoso pelo ID
router.put(
    "/:id/update-elder",
    verifyToken,
    authorize('admin'),
    updateElder
);

// Rota para deletar um idoso pelo ID
router.delete(
    "/:id/delete-elder",
    verifyToken,
    authorize('admin'),
    deleteElderController
);

export default router;
