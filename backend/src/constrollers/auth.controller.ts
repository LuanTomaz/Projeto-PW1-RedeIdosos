import { Request, Response } from "express";
import { User } from "../models/User";
import { Elder } from "../models/Elder";
import { Volunteer } from "../models/Volunteer";
import { Ong } from "../models/Ong";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

interface AuthRequest extends Request {
    user?: any;
}

const registerSchema = z.object({
    nome: z.string().min(3),
    email: z.string().email(),
    senha_hash: z.string().min(6),
    papel: z.enum(['voluntario', 'idoso'])
});

const registerElderSchema = registerSchema.extend({
    papel: z.literal('idoso'),
    endereco: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    data_nascimento: z.string(),
    necessidades_especiais: z.string().optional()
});

const registerVolunteerSchema = registerSchema.extend({
    papel: z.literal('voluntario'),
    disponibilidade: z.string().optional(),
    area_atuacao: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional()
});

const registerOngSchema = z.object({
    nome: z.string().min(3),
    email: z.string().email(),
    senha_hash: z.string().min(6),
    cnpj: z.string(),
    responsavel: z.string(),
    telefone: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional()
});

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

export const registerElder = async (req: Request, res: Response) => {
    try {
        const validated = registerElderSchema.parse(req.body);

        // Verificar se email já existe
        const existingUser = await User.findOne({ email: validated.email });
        if (existingUser) {
            return res.status(400).json({ error: "Email já cadastrado" });
        }

        // Criar usuário
        const hashedPassword = await bcrypt.hash(validated.senha_hash, 10);
        const user = new User({
            nome: validated.nome,
            email: validated.email,
            senha_hash: hashedPassword,
            papel: 'idoso',
            verificado: false,
            ativo: true
        });
        await user.save();

        // Criar perfil de idoso
        const elder = new Elder({
            usuario_id: user._id,
            endereco: validated.endereco,
            latitude: validated.latitude,
            longitude: validated.longitude,
            data_nascimento: new Date(validated.data_nascimento),
            necessidades_especiais: validated.necessidades_especiais
        });
        await elder.save();

        // Gerar token
        const token = jwt.sign(
            { id: user._id, papel: user.papel },
            process.env.JWT_SECRET || "secret",
            { expiresIn: "1d" }
        );

        res.status(201).json({
            message: "Idoso registrado com sucesso",
            token,
            user,
            elder
        });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const registerVolunteer = async (req: Request, res: Response) => {
    try {
        const validated = registerVolunteerSchema.parse(req.body);

        // Verificar se email já existe
        const existingUser = await User.findOne({ email: validated.email });
        if (existingUser) {
            return res.status(400).json({ error: "Email já cadastrado" });
        }

        // Criar usuário
        const hashedPassword = await bcrypt.hash(validated.senha_hash, 10);
        const user = new User({
            nome: validated.nome,
            email: validated.email,
            senha_hash: hashedPassword,
            papel: 'voluntario',
            verificado: false,
            ativo: true
        });
        await user.save();

        // Criar perfil de voluntário
        const volunteer = new Volunteer({
            usuario_id: user._id,
            disponibilidade: validated.disponibilidade,
            area_atuacao: validated.area_atuacao,
            latitude: validated.latitude,
            longitude: validated.longitude,
            verificado: false
        });
        await volunteer.save();

        // Gerar token
        const token = jwt.sign(
            { id: user._id, papel: user.papel },
            process.env.JWT_SECRET || "secret",
            { expiresIn: "1d" }
        );

        res.status(201).json({
            message: "Voluntário registrado com sucesso. Aguardando verificação de ONG ou prefeitura.",
            token,
            user,
            volunteer
        });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const registerOng = async (req: Request, res: Response) => {
    try {
        const validated = registerOngSchema.parse(req.body);

        // Verificar se email já existe
        const existingUser = await User.findOne({ email: validated.email });
        if (existingUser) {
            return res.status(400).json({ error: "Email já cadastrado" });
        }

        // Criar usuário
        const hashedPassword = await bcrypt.hash(validated.senha_hash, 10);
        const user = new User({
            nome: validated.nome,
            email: validated.email,
            senha_hash: hashedPassword,
            papel: 'ong',
            verificado: false,
            ativo: true
        });
        await user.save();

        // Criar perfil de ONG
        const ong = new Ong({
            usuario_id: user._id,
            nome: validated.nome,
            cnpj: validated.cnpj,
            responsavel: validated.responsavel,
            telefone: validated.telefone,
            latitude: validated.latitude,
            longitude: validated.longitude,
            ativo: true
        });
        await ong.save();

        // Gerar token
        const token = jwt.sign(
            { id: user._id, papel: user.papel },
            process.env.JWT_SECRET || "secret",
            { expiresIn: "1d" }
        );

        res.status(201).json({
            message: "ONG registrada com sucesso. Aguardando verificação da administração.",
            token,
            user,
            ong
        });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const logout = async (req: AuthRequest, res: Response) => {
    try {
        // JWT é stateless, logout é apenas informativo no frontend
        res.json({ message: "Desconectado com sucesso" });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
