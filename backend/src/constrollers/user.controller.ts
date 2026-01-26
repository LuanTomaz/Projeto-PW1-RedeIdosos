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
        const users = await UserService.getUsers();
        res.json(users);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
