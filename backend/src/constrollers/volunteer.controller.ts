import { Request, Response } from "express";
import * as VolunteerService from "../services/volunteer.service";
import { z } from "zod";

interface AuthRequest extends Request {
    user?: any;
}

const volunteerSchema = z.object({
    usuario_id: z.string(),
    documentos_url: z.array(z.string()).optional(),
    disponibilidade: z.string().optional(),
    area_atuacao: z.string().optional(),
    verificado: z.boolean().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional()
});

export const createVolunteer = async (req: Request, res: Response) => {
    try {
        const validated = volunteerSchema.parse(req.body);
        const volunteer = await VolunteerService.createVolunteer({
            ...validated,
            usuario_id: validated.usuario_id as any
        });
        res.status(201).json(volunteer);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const getVolunteers = async (req: Request, res: Response) => {
    try {
        const volunteers = await VolunteerService.getVolunteers();
        res.json(volunteers);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const updateVolunteer = async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const volunteer = await VolunteerService.updateVolunteer(id, req.body);
        res.json(volunteer);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const deleteVolunteer = async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        await VolunteerService.deleteVolunteer(id);
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

        const volunteer = await VolunteerService.getVolunteerByUserId(usuario_id);
        if (!volunteer) {
            return res.status(404).json({ error: "Perfil de voluntário não encontrado" });
        }

        res.json(volunteer);
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

        const volunteer = await VolunteerService.updateVolunteerByUserId(usuario_id, req.body);
        res.json(volunteer);
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

        const volunteer = await VolunteerService.updateVolunteerByUserId(usuario_id, { latitude, longitude });
        res.json(volunteer);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};
