import { Router } from "express";
import { createVolunteer, getVolunteers, updateVolunteer, deleteVolunteer, getMyProfile, updateMyProfile, updateMyLocation } from "../controllers/volunteer.controller";
import { verifyToken } from "../middlewares/auth_middleware";
import { requireActiveUser } from "../middlewares/status";
import { authorize } from "../middlewares/authorization.middleware";

const router = Router();

// Rota para obter o perfil do voluntário autenticado
router.get(
    "/me/profile",
    verifyToken, 
    authorize("voluntario"),
    requireActiveUser,
    getMyProfile
);

// Rota para atualizar o perfil do voluntário autenticado
router.put(
    "/update-profile", 
    verifyToken, 
    authorize("voluntario"),
    requireActiveUser,
    updateMyProfile
);

// Rota para atualizar a localização do voluntário autenticado
router.put(
    "/update-location", 
    verifyToken, 
    authorize("voluntario"),
    requireActiveUser,
    updateMyLocation
);

// Rota para listar voluntários (apenas admin)
router.get(
    "/list", 
    verifyToken, 
    authorize("admin", "ong", "voluntario", "idoso"),
    requireActiveUser,
    getVolunteers
);

// Rota para editar voluntário (apenas admin)
router.put(
    "/:id/update", 
    verifyToken,
    authorize("admin"),
    requireActiveUser, 
    updateVolunteer
);

// Rota para deletar voluntário (apenas admin)
router.delete(
    "/:id/delete", 
    verifyToken, 
    authorize("admin"),
    requireActiveUser,
    deleteVolunteer
);

export default router;
