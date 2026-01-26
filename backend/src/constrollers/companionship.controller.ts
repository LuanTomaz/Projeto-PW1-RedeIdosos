import { Request, Response } from "express";
import * as CompanionshipService from "../services/companionship.service";
import { z } from "zod";

interface AuthRequest extends Request {
    user?: any;
}

const companionshipSchema = z.object({
    idoso_id: z.string(),
    voluntario_id: z.string().optional(),
    atividade: z.string(),
    descricao: z.string().optional(),
    data: z.string(),
    hora: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    local_descricao: z.string().optional(),
    status: z.enum(['pendente','aceita','em_andamento','concluida','cancelada']).optional(),
    foto_comprovante_url: z.string().optional()
});

export const createCompanionship = async (req: Request, res: Response) => {
    try {
        const validated = companionshipSchema.parse(req.body);
        const companionship = await CompanionshipService.createCompanionship({
            ...validated,
            idoso_id: validated.idoso_id as any,
            voluntario_id: validated.voluntario_id as any,
            data: new Date(validated.data)
        });
        res.status(201).json(companionship);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const getCompanionships = async (req: Request, res: Response) => {
    try {
        const companionships = await CompanionshipService.getCompanionships();
        res.json(companionships);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const updateCompanionship = async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const companionship = await CompanionshipService.updateCompanionship(id, req.body);
        res.json(companionship);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const deleteCompanionship = async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        await CompanionshipService.deleteCompanionship(id);
        res.status(204).send();
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// Endpoints de Status
export const acceptCompanionship = async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const { voluntario_id } = req.body;

        if (!voluntario_id) {
            return res.status(400).json({ error: "voluntario_id é obrigatório" });
        }

        const companionship = await CompanionshipService.acceptCompanionship(id, voluntario_id);
        res.json(companionship);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const completeCompanionship = async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const { foto_comprovante_url } = req.body;

        const companionship = await CompanionshipService.completeCompanionship(id, foto_comprovante_url);
        res.json(companionship);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const updateCompanionshipStatus = async (req: AuthRequest, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: "status é obrigatório" });
        }

        const companionship = await CompanionshipService.updateCompanionshipStatus(id, status);
        res.json(companionship);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const getCompanionshipsByUser = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { userType } = req.query;

        if (!userId) {
            return res.status(401).json({ error: "Usuário não autenticado" });
        }

        if (!userType || (userType !== "idoso" && userType !== "voluntario")) {
            return res.status(400).json({ error: "userType deve ser 'idoso' ou 'voluntario'" });
        }

        const companionships = await CompanionshipService.getCompanionshipsByUser(userId, userType as "idoso" | "voluntario");
        res.json(companionships);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};
