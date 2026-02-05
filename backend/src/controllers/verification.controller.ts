import { Request, Response } from "express";
import { User } from "../models/User";
import * as UserService from "../services/user.service";

export const getVerifications = async (req: Request, res: Response) => {
    try {
        const users = await User.find({
            verificado: false,
            ativo: true,
            papel: "pending"
        });
        res.json(users);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const approveVerification = async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const user = await UserService.validateUser(id);
        res.json({ message: "Usuario validado com sucesso", user });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const deleteVerification = async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const user = await UserService.blockUser(id);
        res.json({ message: "Usuario bloqueado", user });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};
