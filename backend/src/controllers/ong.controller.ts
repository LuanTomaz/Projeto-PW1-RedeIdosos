import { Request, Response } from "express";
import * as OngService from "../services/ong.service";
import * as UserService from "../services/user.service";
import { z } from "zod";
import mongoose from "mongoose";

interface AuthRequest extends Request {
    user?: any;
}

// Esquema de validação para criação/atualização de ONG
const ongSchema = z.object({
    usuario_id: z.string(),
    nome: z.string(),
    cnpj: z.string(),
    telefone: z.string().optional(),
    responsavel: z.string().optional(),
    foto_url: z.string().optional(),
    localizacao: z.object({
        type: z.literal("Point"),
        coordinates: z.tuple([
            z.number(), // latitude
            z.number(), // longitude
        ]),
    }),
    ativo: z.boolean().optional()
});

// Controlador para criar uma nova ONG
export const createOng = async (req: Request, res: Response) => {
    try {
        const validated = ongSchema.parse(req.body);
        const ong = await OngService.createOng({
            ...validated,
            usuario_id: validated.usuario_id as any
        });
        res.status(201).json(ong);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};


// Controlador para obter todas as ONGs
export const getOngs = async (req: Request, res: Response) => {
    try {
        const ongs = await OngService.getOngs();
        res.json(ongs);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// Controlador para atualizar uma ONG pelo ID
export const updateOng = async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const ong = await OngService.updateOng(id, req.body);
        res.json(ong);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// Controlador para deletar uma ONG pelo ID
export const deleteOng = async (req: Request, res: Response) => {
    try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ error: "ID inválido" });
            }
    
            const ong = await OngService.getOngById(id);
            if (!ong) {
                return res.status(404).json({ error: "ONG não encontrada" });
            }
    
            const userId = ong.usuario_id._id?.toString();
    
            // Deletar o idoso
            await OngService.deleteOng(id);
    
            // Deletar o usuário relacionado
            if (userId) {
                try {
                    await UserService.deleteUser(userId);
                } catch (err) {
                    console.error("Erro ao deletar o usuário:", err);
                }
            }
    
            return res.status(200).json({
                success: true,
                message: "ONG e usuário deletados (ou ONG deletada, se houve problema no usuário).",
                ongId: id,
                userId
            });
    
        } catch (err: any) {
            console.error(err);
            res.status(500).json({ error: "Erro interno do servidor" });
        }
};

// Controlador para obter o perfil da ONG autenticada
export const getMyProfile = async (req: AuthRequest, res: Response) => {
    try {
        const usuario_id = req.user?.id;

        if (!usuario_id) {
            return res.status(401).json({ error: "Usuário não autenticado" });
        }

        const ong = await OngService.getOngByUserId(usuario_id);
        if (!ong) {
            return res.status(404).json({ error: "Perfil de ONG não encontrado" });
        }

        res.json(ong);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// Controlador para atualizar o perfil da ONG autenticada
export const updateMyProfile = async (req: AuthRequest, res: Response) => {
    try {
        const usuario_id = req.user?.id;

        if (!usuario_id) {
            return res.status(401).json({ error: "Usuário não autenticado" });
        }

        const ong = await OngService.updateOngByUserId(usuario_id, req.body);
        res.json(ong);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// Controlador para atualizar a localização da ONG autenticada
export const updateMyLocation = async (req: AuthRequest, res: Response) => {
    try {
        const usuario_id = req.user?.id;
        const { latitude, longitude } = req.body;

        if (!usuario_id) {
            return res.status(401).json({ error: "Usuário não autenticado" });
        }

        if (typeof latitude !== "number" || typeof longitude !== "number") {
            return res.status(400).json({ error: "Latitude e longitude são obrigatórias e devem ser números" });
        }

        const updateData = {
            localizacao: {
                type: "Point",
                coordinates: [
                    longitude,
                    latitude
                ] as [number, number]
            }
        }

        const ong = await OngService.updateOngByUserId(usuario_id, updateData);
        res.json(ong);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};
