import { Request, Response } from "express";
import * as ElderService from "../services/elder.service";
import { z } from "zod";

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
