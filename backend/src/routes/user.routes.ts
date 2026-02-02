import { Router } from 'express';
import { createUser, getUsers, validateUser, changeUserRole, changeUserStatus, blockUser, getVolunteers, getElders, getOngs, getAdmins, getGestoresPublicos, getUnverifiedVolunteers } from '../constrollers/user.controller';
import { verifyToken } from '../middlewares/auth_middleware';

const router = Router();

// Apenas usuários autenticados podem listar usuários
router.get('/list-users', verifyToken, getUsers);

// Criação de usuário aberta ou pode ser só para admin
router.post('/create-user', createUser);

// Endpoints de validação/status
router.put('/:id/validate', verifyToken, validateUser);
router.put('/:id/verify', verifyToken, validateUser); // Alias para ONG verificar
router.put('/:id/role', verifyToken, changeUserRole);
router.put('/:id/status', verifyToken, changeUserStatus);
router.put('/:id/block', verifyToken, blockUser);

// Endpoints de Filtros por Papel
router.get('/filtro/voluntarios', verifyToken, getVolunteers);
router.get('/filtro/idosos', verifyToken, getElders);
router.get('/filtro/ongs', verifyToken, getOngs);
router.get('/filtro/admins', verifyToken, getAdmins);
router.get('/filtro/gestores', verifyToken, getGestoresPublicos);
router.get('/filtro/voluntarios/unverified', verifyToken, getUnverifiedVolunteers);

export default router;
