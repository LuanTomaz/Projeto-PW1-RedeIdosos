import { Request, Response } from "express";
import * as VolunteerService from "../services/volunteer.service";
import * as UserService from "../services/user.service";
import { z } from "zod";
import { User } from "../models/User";
import { Volunteer } from "../models/Volunteer";
import { deleteNodeById } from "../neo4j/utils/delete";

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

// Controlador para listar voluntÃ¡rios
export const getVolunteers = async (req: Request, res: Response) => {
    try {
        const volunteers = await VolunteerService.getVolunteers();
        res.json(volunteers);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// Controlador para atualizar voluntÃ¡rio
export const updateVolunteer = async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const volunteer = await VolunteerService.updateVolunteer(id, req.body);
        res.json(volunteer);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// Controlador para deletar voluntÃ¡rio
export const deleteVolunteer = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    // Busca o voluntÃ¡rio
    const volunteer = await Volunteer.findById(id);

    if (!volunteer) {
      return res.status(404).json({ error: "VoluntÃ¡rio nÃ£o encontrado" });
    }

    // Remove o usuÃ¡rio associado
    await User.findByIdAndDelete(volunteer.usuario_id);

    // Neo4j: remove nodes
    await deleteNodeById('Volunteer', id);
    await deleteNodeById('User', volunteer.usuario_id.toString());

    // Remove o voluntÃ¡rio
    await Volunteer.findByIdAndDelete(id);

    return res.status(200).json({
            success: true,
            message: "VoluntÃ¡rio e usuÃ¡rio deletados (ou voluntÃ¡rio deletado, se houve problema no usuÃ¡rio).",
            volunteerId: id,
            userId: volunteer.usuario_id
        });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// Controlador para obter o perfil do voluntÃ¡rio autenticado
export const getMyProfile = async (req: AuthRequest, res: Response) => {
    try {
        const usuario_id = req.user?.id;

        if (!usuario_id) {
            return res.status(401).json({ error: "UsuÃ¡rio nÃ£o autenticado" });
        }

        const volunteer = await VolunteerService.getVolunteerByUserId(usuario_id);
        if (!volunteer) {
            return res.status(404).json({ error: "Perfil de voluntÃ¡rio nÃ£o encontrado" });
        }

        res.json(volunteer);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// Controlador para atualizar o perfil do voluntÃ¡rio autenticado
export const updateMyProfile = async (req: AuthRequest, res: Response) => {
    try {
        const usuario_id = req.user?.id;

        if (!usuario_id) {
            return res.status(401).json({ error: "UsuÃ¡rio nÃ£o autenticado" });
        }

        const {
            rg,
            cpf,
            comprovante_residencia_url,
            foto_perfil_url,
            ...volunteerPayload
        } = req.body ?? {};

        const userUpdates: Record<string, unknown> = {};
        if (rg) userUpdates.rg = rg;
        if (cpf) userUpdates.cpf = cpf;
        if (comprovante_residencia_url) userUpdates.comprovante_residencia_url = comprovante_residencia_url;
        if (foto_perfil_url) userUpdates.foto_perfil_url = foto_perfil_url;

        if (Object.keys(userUpdates).length > 0) {
            await UserService.updateUser(usuario_id, userUpdates);
        }

        const volunteer = await VolunteerService.updateVolunteerByUserId(usuario_id, volunteerPayload);
        res.json(volunteer);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};
// Controlador para atualizar a localizaÃ§Ã£o do voluntÃ¡rio autenticado
export const updateMyLocation = async (req: AuthRequest, res: Response) => {
    try {
        const usuario_id = req.user?.id;
        const { latitude, longitude } = req.body;

        if (!usuario_id) {
            return res.status(401).json({ error: "UsuÃ¡rio nÃ£o autenticado" });
        }

        if (typeof latitude !== "number" || typeof longitude !== "number") {
            return res.status(400).json({ error: "Latitude e longitude sÃ£o obrigatÃ³rias e devem ser nÃºmeros" });
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
