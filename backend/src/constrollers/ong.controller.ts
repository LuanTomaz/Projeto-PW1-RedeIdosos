import { Request, Response } from "express";
import * as OngService from "../services/ong.service";
import { z } from "zod";

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
