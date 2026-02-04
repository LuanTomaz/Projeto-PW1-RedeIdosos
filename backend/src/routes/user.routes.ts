import { Router } from 'express';
import { createUser, getUsers, validateUserController, blockUser, getVolunteers, getElders, getOngs, getAdmins, getUnverifiedVolunteers, promoteToAdmin, devActivateUser } from '../controllers/user.controller';
import { verifyToken } from '../middlewares/auth_middleware';
import { authorize } from '../middlewares/authorization.middleware';
import { requireActiveUser } from '../middlewares/status';

const router = Router();

// Apenas usuários autenticados podem listar usuários
router.get(
    '/list-users',
    verifyToken,
    requireActiveUser,
    getUsers
);

// Criação de usuário aberta
router.post(
    '/create-user',
    createUser
);

// Endpoints de validação/status
router.put(
    '/:id/validate',
    verifyToken,
    authorize('admin'),
    requireActiveUser,
    validateUserController
);

// Endpoint para promover usuário a admin
router.put(
    "/:id/promote-admin",
    verifyToken,
    authorize("admin"),
    requireActiveUser,
    promoteToAdmin
);

// Endpoint para bloquear usuário
router.put(
    '/:id/block-user',
    verifyToken,
    authorize('admin'),
    requireActiveUser,
    blockUser
);

// Endpoints de Filtros por Papel
router.get(
    '/filtro/voluntarios', 
    verifyToken, 
    getVolunteers
);

router.get(
    '/filtro/idosos', 
    verifyToken, 
    getElders
);

router.get(
    '/filtro/ongs', 
    verifyToken, 
    getOngs
);

router.get(
    '/filtro/admins',
     verifyToken, 
     getAdmins
);

router.get(
    '/filtro/voluntarios/unverified',
     verifyToken, 
     getUnverifiedVolunteers
);

// Dev-only: ativar/verificar usuario para testes
router.post(
    '/dev/activate',
    devActivateUser
);

export default router;
