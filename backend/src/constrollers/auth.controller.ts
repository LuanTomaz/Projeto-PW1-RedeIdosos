import { Request, Response } from "express";
import { User } from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const login = async (req: Request, res: Response) => {
    try {
        const { email, senha_hash } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

        const validPassword = await bcrypt.compare(senha_hash, user.senha_hash);
        if (!validPassword) return res.status(401).json({ error: "Senha incorreta" });

        const token = jwt.sign(
            { id: user._id, papel: user.papel },
            process.env.JWT_SECRET || "secret",
            { expiresIn: "1d" }
        );

        res.json({ token, user });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
