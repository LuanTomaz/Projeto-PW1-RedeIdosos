import { Request, Response } from "express";
import { User } from "../models/User";
import { Elder } from "../models/Elder";
import { Volunteer } from "../models/Volunteer";
import { Ong } from "../models/Ong";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { Auth } from "mongodb";

interface AuthRequest extends Request {
    user?: any;
}

// Schema para usuário no geral
const registerSchema = z.object({
    nome: z.string().min(3),
    email: z.string().email(),
    senha_hash: z.string().min(6),
    papel: z.enum(['voluntario', 'idoso'])
});

// Schema para idoso
const registerElderSchema = registerSchema.extend({
    papel: z.literal('idoso'),
    endereco: z.string(),
    localizacao: z.object({
        type: z.literal("Point"),
        coordinates: z.tuple([
            z.number(), // latitude
            z.number(), // longitude
        ]),
    }),
    data_nascimento: z.string(),
    necessidades_especiais: z.string().optional()
});

// Schema para voluntário
const registerVolunteerSchema = registerSchema.extend({
    papel: z.literal('voluntario'),
    disponibilidade: z.string().optional(),
    area_atuacao: z.string().optional(),
    localizacao: z.object({
        type: z.literal("Point"),
        coordinates: z.tuple([
            z.number(), // latitude
            z.number(), // longitude
        ]),
    }),
});

// Schema pra ongs
const registerOngSchema = z.object({
    nome: z.string().min(3),
    email: z.string().email(),
    senha_hash: z.string().min(6),
    cnpj: z.string(),
    responsavel: z.string(),
    telefone: z.string().optional(),
    localizacao: z.object({
        type: z.literal("Point"),
        coordinates: z.tuple([
            z.number(), // latitude
            z.number(), // longitude
        ]),
    }),
});

// Controller para login de um usuário
export const login = async (req: Request, res: Response) => {
    try {
        const { email, senha_hash } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

        const validPassword = await bcrypt.compare(senha_hash, user.senha_hash);
        if (!validPassword) return res.status(401).json({ error: "Senha incorreta" });

        const token = jwt.sign(
            {
                id: user._id,
                papel: user.papel,
                tipo_cadastro: user.tipo_cadastro,
                verificado: user.verificado
            },
            process.env.JWT_SECRET || "secret",
            { expiresIn: "1d" }
        );

        res.json({ token, user });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// Controller para registrar um idoso
export const createElderProfile = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Não autenticado" });
        }

        if (req.user.tipo_cadastro !== "idoso") {
            return res.status(403).json({ error: "Tipo de cadastro inválido" });
        }

        const validated = z.object({
            endereco: z.string(),
            localizacao: z.object({
                type: z.literal("Point"),
                coordinates: z.tuple([z.number(), z.number()]),
            }),
            data_nascimento: z.string(),
            necessidades_especiais: z.string().optional(),
        }).parse(req.body);

        const existing = await Elder.findOne({ usuario_id: req.user.id });
        if (existing) {
            return res.status(400).json({ error: "Perfil já existe" });
        }

        const elder = await Elder.create({
            usuario_id: req.user.id,
            ...validated,
            data_nascimento: new Date(validated.data_nascimento),
        });

        await User.findByIdAndUpdate(req.user.id, {
            ativo: true,
        });

        res.status(201).json(elder);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};


// Controller para registrar um voluntário.
export const createVolunteerProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    if (req.user.tipo_cadastro !== "voluntario") {
      return res.status(403).json({ error: "Tipo de cadastro inválido" });
    }

    const validated = z.object({
      disponibilidade: z.string().optional(),
      area_atuacao: z.string().optional(),
      localizacao: z.object({
        type: z.literal("Point"),
        coordinates: z.tuple([z.number(), z.number()]),
      }),
    }).parse(req.body);

    const existing = await Volunteer.findOne({ usuario_id: req.user.id });
    if (existing) {
      return res.status(400).json({ error: "Perfil já existe" });
    }

    const volunteer = await Volunteer.create({
      usuario_id: req.user.id,
      ...validated,
      verificado: false,
    });

    await User.findByIdAndUpdate(req.user.id, {
      ativo: true,
    });

    res.status(201).json(volunteer);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};


// Controller para registrar uma ong
export const createOngProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    if (req.user.tipo_cadastro !== "ong") {
      return res.status(403).json({ error: "Tipo de cadastro inválido" });
    }

    const validated = z.object({
      cnpj: z.string(),
      responsavel: z.string(),
      telefone: z.string().optional(),
      localizacao: z.object({
        type: z.literal("Point"),
        coordinates: z.tuple([z.number(), z.number()]),
      }),
    }).parse(req.body);

    const existing = await Ong.findOne({ usuario_id: req.user.id });
    if (existing) {
      return res.status(400).json({ error: "Perfil já existe" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const ong = await Ong.create({
      usuario_id: user._id,
      nome: user.nome, 
      ...validated,
      ativo: true,
    });

    await User.findByIdAndUpdate(user._id, {
      ativo: true,
    });

    res.status(201).json(ong);
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
