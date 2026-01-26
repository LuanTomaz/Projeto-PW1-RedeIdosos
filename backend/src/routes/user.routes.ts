import { Router } from 'express';
import { createUser, getUsers, validateUser, changeUserRole, changeUserStatus, blockUser } from '../constrollers/user.controller';
import { verifyToken } from '../middlewares/auth_middleware';

const router = Router();

// Apenas usuários autenticados podem listar usuários
router.get('/', verifyToken, getUsers);

// Criação de usuário aberta ou pode ser só para admin
router.post('/', createUser);

// Endpoints de validação/status
router.put('/:id/validate', verifyToken, validateUser);
router.put('/:id/verify', verifyToken, validateUser); // Alias para ONG verificar
router.put('/:id/role', verifyToken, changeUserRole);
router.put('/:id/status', verifyToken, changeUserStatus);
router.put('/:id/block', verifyToken, blockUser);
export default router;
