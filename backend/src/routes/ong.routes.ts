import { Router } from "express";
import {
    createOng,
    getOngs,
    updateOng,
    deleteOng,
    getMyProfile,
    updateMyProfile,
    updateMyLocation
} from "../controllers/ong.controller";
import { verifyToken } from "../middlewares/auth_middleware";
import { authorize } from "../middlewares/authorization.middleware";
import { requireActiveUser } from "../middlewares/status";

const router = Router();

// Rota para obter o perfil da ONG autenticada
router.get(
    "/profile",
    verifyToken,
    authorize('ong'),
    requireActiveUser,
    getMyProfile
);

// Rota para atualizar o perfil da ONG autenticada
router.put(
    "/update-profile",
    verifyToken,
    authorize('ong'),
    requireActiveUser,
    updateMyProfile
);

//  Rota para atualizar a localização da ONG autenticada
router.put(
    "/update-location",
    verifyToken,
    authorize('ong'),
    requireActiveUser,
    updateMyLocation
);

// Rotas para listar todas as ONGs (disponível apenas para administradores)
router.get(
    "/list-ongs",
    verifyToken,
    authorize('admin'),
    requireActiveUser,
    getOngs
);

// Rota para criar uma nova ONG (por enquando off)
// router.post("/", verifyToken, createOng);

// Rota para atualizar uma ONG pelo ID
router.put(
    "/:id/update-ong",
    verifyToken,
    authorize('admin'),
    requireActiveUser,
    updateOng
);

// Rota para deletar uma ONG pelo ID
router.delete(
    "/:id/delete-ong",
    verifyToken,
    authorize('admin'),
    requireActiveUser,
    deleteOng
);

export default router;