import { Request, Response } from "express";
import * as ElderService from "../services/elder.service";
import { z } from "zod";

interface AuthRequest extends Request {
    user?: any;
}

const elderSchema = z.object({
    usuario_id: z.string(),
    endereco: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    data_nascimento: z.string(),
    necessidades_especiais: z.string().optional()
});

export const createElder = async (req: Request, res: Response) => {
    try {
        const validated = elderSchema.parse(req.body);
        const elder = await ElderService.createElder({
            ...validated,
            usuario_id: validated.usuario_id as any,
            data_nascimento: new Date(validated.data_nascimento)
        });
        res.status(201).json(elder);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const getElders = async (req: Request, res: Response) => {
    try {
        const elders = await ElderService.getElders();
        res.json(elders);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const updateElder = async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const elder = await ElderService.updateElder(id, req.body);
        res.json(elder);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const deleteElder = async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        await ElderService.deleteElder(id);
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

        const elder = await ElderService.getElderByUserId(usuario_id);
        if (!elder) {
            return res.status(404).json({ error: "Perfil de idoso não encontrado" });
        }

        res.json(elder);
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

        const elder = await ElderService.updateElderByUserId(usuario_id, req.body);
        res.json(elder);
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

        const elder = await ElderService.updateElderByUserId(usuario_id, { latitude, longitude });
        res.json(elder);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};
