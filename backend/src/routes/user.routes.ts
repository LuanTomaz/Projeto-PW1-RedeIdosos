import { Router } from 'express';
import { createUser, getUsers, validateUserController, blockUser, updateUserStatus, updateUserController, updateMyUserController, deleteUserController, getVolunteers, getElders, getOngs, getAdmins, getUnverifiedVolunteers, promoteToAdmin, devActivateUser } from '../controllers/user.controller';
import { verifyToken } from '../middlewares/auth_middleware';
import { authorize } from '../middlewares/authorization.middleware';
import { requireActiveUser } from '../middlewares/status';

const router = Router();

// Apenas usuÃ¡rios autenticados podem listar usuÃ¡rios
router.get(
    '/list-users',
    verifyToken,
    requireActiveUser,
    getUsers
);

// CriaÃ§Ã£o de usuÃ¡rio aberta
router.post(
    '/create-user',
    createUser
);

// Endpoints de validaÃ§Ã£o/status
router.put(
    '/:id/validate',
    verifyToken,
    authorize('admin', 'ong'),
    requireActiveUser,
    validateUserController
);

// Endpoint para promover usuÃ¡rio a admin
router.put(
    "/:id/promote-admin",
    verifyToken,
    authorize("admin"),
    requireActiveUser,
    promoteToAdmin
);

// Endpoint para bloquear usuÃ¡rio
router.put(
    '/:id/block-user',
    verifyToken,
    authorize('admin', 'ong'),
    requireActiveUser,
    blockUser
);
// Endpoint para atualizar status ativo/inativo
router.put(
    '/:id/status',
    verifyToken,
    authorize('admin'),
    requireActiveUser,
    updateUserStatus
);

// Endpoint para atualizar dados do usuÃ¡rio autenticado
router.put(
    '/me/update',
    verifyToken,
    authorize('admin', 'ong', 'voluntario', 'idoso', 'pending'),
    requireActiveUser,
    updateMyUserController
);

// Endpoint para atualizar dados do usuÃ¡rio
router.put(
    '/:id/update',
    verifyToken,
    authorize('admin'),
    requireActiveUser,
    updateUserController
);

// Endpoint para remover usuÃ¡rio
router.delete(
    '/:id/delete',
    verifyToken,
    authorize('admin'),
    requireActiveUser,
    deleteUserController
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
