import { Router } from 'express';
import { createUser, getUsers } from '../constrollers/user.controller';
import { verifyToken } from '../middlewares/auth_middleware';

const router = Router();

// Apenas usuários autenticados podem listar usuários
router.get('/', verifyToken, getUsers);

// Criação de usuário aberta ou pode ser só para admin
router.post('/', createUser);

export default router;
