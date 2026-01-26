import { Request, Response } from "express";
import * as OngService from "../services/ong.service";
import { z } from "zod";

interface AuthRequest extends Request {
    user?: any;
}

const ongSchema = z.object({
    usuario_id: z.string(),
    nome: z.string(),
    cnpj: z.string(),
    telefone: z.string().optional(),
    responsavel: z.string().optional(),
    foto_url: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    ativo: z.boolean().optional()
});

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

export const getOngs = async (req: Request, res: Response) => {
    try {
        const ongs = await OngService.getOngs();
        res.json(ongs);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const updateOng = async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const ong = await OngService.updateOng(id, req.body);
        res.json(ong);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const deleteOng = async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        await OngService.deleteOng(id);
        res.status(204).send();
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// Endpoints /me
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

        const ong = await OngService.updateOngByUserId(usuario_id, { latitude, longitude });
        res.json(ong);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};
