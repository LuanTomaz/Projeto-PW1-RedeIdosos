import { Router } from "express";
import { createCompanionship, getCompanionships, updateCompanionship, deleteCompanionship, acceptCompanionship, completeCompanionship, updateCompanionshipStatus, getCompanionshipsByUser } from "../constrollers/companionship.controller";
import { verifyToken } from "../middlewares/auth_middleware";
import { authorize } from "../middlewares/authorization.middleware";
import {upload} from "../middlewares/upload";

const router = Router();

// Rota para listar todas as companhias.
router.get(
    "/list-companionships", 
    verifyToken, 
    authorize('admin'),
    getCompanionships
);

// Rota para listar companhias do usuário autenticado.
router.get(
    "/my-companionships", 
    verifyToken,
    authorize('voluntario', 'idoso'), 
    getCompanionshipsByUser
);

// Rota para criar uma nova companhia.
router.post(
    "/create-companionship", 
    verifyToken,
    authorize('admin'), 
    createCompanionship
);

// Rota para aceitar uma companhia.
router.patch(
    "/:id/accept", 
    verifyToken, 
    authorize('voluntario'),
    acceptCompanionship
);

// Rota para completar uma companhia.
router.put(
    "/:id/update", 
    verifyToken, 
    authorize('admin', 'voluntario'),
    updateCompanionship
);

// Rota para atualizar o status de uma companhia.
router.put(
    "/:id/status", 
    verifyToken, 
    authorize('admin', 'voluntario'),
    updateCompanionshipStatus
);

// Rota para completar uma companhia com upload de foto.
router.put(
    "/:id/complete", 
    verifyToken, 
    authorize('voluntario'),
    upload.single('foto_comprovante'),
    completeCompanionship
);

// Rota para deletar uma companhia.
router.delete(
    "/:id/delete", 
    verifyToken, 
    authorize('admin'),
    deleteCompanionship
);

export default router;
