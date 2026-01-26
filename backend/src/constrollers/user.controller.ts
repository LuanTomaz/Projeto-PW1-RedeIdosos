import { Request, Response } from "express";
import * as UserService from "../services/user.service";
import { z } from "zod";

// Usando validação com Zod
const createUserSchema = z.object({
    nome: z.string().min(3),
    email: z.string().email(),
    senha_hash: z.string().min(6),
    papel: z.enum(['admin','gestor_publico','ong','voluntario','idoso']),
});

export const createUser = async (req: Request, res: Response) => {
    try {
        const validated = createUserSchema.parse(req.body);
        const user = await UserService.createUser(validated);
        res.status(201).json(user);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const getUsers = async (req: Request, res: Response) => {
    try {
        const { papel } = req.query;
        
        let users;
        if (papel) {
            users = await UserService.getUsersByRole(papel as string);
        } else {
            users = await UserService.getUsers();
        }
        res.json(users);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// Endpoints de Validação/Verificação
export const validateUser = async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const user = await UserService.validateUser(id);
        res.json({ message: "Usuário validado com sucesso", user });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const changeUserRole = async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const { papel } = req.body;

        if (!papel) {
            return res.status(400).json({ error: "papel é obrigatório" });
        }

        const user = await UserService.changeUserRole(id, papel);
        res.json({ message: "Papel do usuário alterado com sucesso", user });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const changeUserStatus = async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const { ativo } = req.body;

        if (typeof ativo !== "boolean") {
            return res.status(400).json({ error: "ativo deve ser um booleano" });
        }

        const user = await UserService.changeUserStatus(id, ativo);
        res.json({ message: "Status do usuário alterado com sucesso", user });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const blockUser = async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const user = await UserService.blockUser(id);
        res.json({ message: "Usuário bloqueado com sucesso", user });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};
