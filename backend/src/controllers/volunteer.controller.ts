import { Request, Response } from "express";
import * as VolunteerService from "../services/volunteer.service";
import { z } from "zod";
import { User } from "../models/User";
import { Volunteer } from "../models/Volunteer";

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

// Controlador para listar voluntários
export const getVolunteers = async (req: Request, res: Response) => {
    try {
        const volunteers = await VolunteerService.getVolunteers();
        res.json(volunteers);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// Controlador para atualizar voluntário
export const updateVolunteer = async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const volunteer = await VolunteerService.updateVolunteer(id, req.body);
        res.json(volunteer);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// Controlador para deletar voluntário
export const deleteVolunteer = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    // Busca o voluntário
    const volunteer = await Volunteer.findById(id);

    if (!volunteer) {
      return res.status(404).json({ error: "Voluntário não encontrado" });
    }

    // Remove o usuário associado
    await User.findByIdAndDelete(volunteer.usuario_id);

    // Remove o voluntário
    await Volunteer.findByIdAndDelete(id);

    return res.status(200).json({
            success: true,
            message: "Voluntário e usuário deletados (ou voluntário deletado, se houve problema no usuário).",
            volunteerId: id,
            userId: volunteer.usuario_id
        });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// Controlador para obter o perfil do voluntário autenticado
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

// Controlador para atualizar o perfil do voluntário autenticado
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

// Controlador para atualizar a localização do voluntário autenticado
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

        const volunteer = await VolunteerService.updateVolunteerByUserId(usuario_id, updateData );
        res.json(volunteer);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};
