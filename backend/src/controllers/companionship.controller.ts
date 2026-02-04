import { Request, Response } from "express";
import * as CompanionshipService from "../services/companionship.service";
import { z } from "zod";
import cloudinary from "../config/cloudinary";
import { createCompanionshipNode, updateCompanionshipStatusNode } from "../neo4j/nodes/companionship.node";
import { createElderNode } from "../neo4j/nodes/elder.node";
import { createVolunteerNode } from "../neo4j/nodes/volunteer.node";
import { createCompanionshipRelations, createElderRequestCompanionship } from "../neo4j/relations/companionship.relation";
import { deleteNodeById } from "../neo4j/utils/delete";

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
    localizacao: z.object({
        type: z.literal("Point"),
        coordinates: z.tuple([
            z.number(), // latitude
            z.number(), // longitude
        ]),
    }),
    local_descricao: z.string().optional(),
    status: z.enum(['pendente', 'aceita', 'em_andamento', 'concluida', 'cancelada']).optional(),
    foto_comprovante_url: z.string().optional()
});

// Controller para criar uma nova companhia.
export const createCompanionship = async (req: Request, res: Response) => {
    try {
        const validated = companionshipSchema.parse(req.body);
        const companionship = await CompanionshipService.createCompanionship({
            ...validated,
            idoso_id: validated.idoso_id as any,
            voluntario_id: validated.voluntario_id as any,
            data: new Date(validated.data)
        });

        // Neo4j
        const companionshipId = companionship._id.toString();
        await createCompanionshipNode(companionshipId, companionship.status, companionship.data);
        await createElderNode(validated.idoso_id);
        if (validated.voluntario_id) {
            await createVolunteerNode(validated.voluntario_id);
            await createCompanionshipRelations(validated.idoso_id, validated.voluntario_id, companionshipId);
        } else {
            await createElderRequestCompanionship(validated.idoso_id, companionshipId);
        }
        res.status(201).json(companionship);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// Controller para listar as companhias.
export const getCompanionships = async (req: Request, res: Response) => {
    try {
        const companionships = await CompanionshipService.getCompanionships();
        res.json(companionships);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// Controller para atualizar uma companhia.
export const updateCompanionship = async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const companionship = await CompanionshipService.updateCompanionship(id, req.body);
        res.json(companionship);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// Controller para deletar uma companhia.
export const deleteCompanionship = async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        await CompanionshipService.deleteCompanionship(id);

        // Neo4j
        await deleteNodeById('Companionship', id);
        return res.status(200).json({
            success: true,
            message: "Companhia deletada com sucesso.",
            id
        });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// Endpoints de Status
export const acceptCompanionship = async (req: AuthRequest, res: Response) => {
    try {
        const companionshipId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const voluntarioId = req.user?.id;

        if (!voluntarioId) {
            return res.status(400).json({ error: "voluntario_id é obrigatório" });
        }

        const companionship = await CompanionshipService.acceptCompanionship(companionshipId, voluntarioId);
        if (!companionship) {
            return res.status(404).json({ error: "Companhia não encontrada" });
        }

        // Neo4j
        try {
            const elderId = String((companionship as any).idoso_id);
            const volId = String((companionship as any).voluntario_id);
            if (elderId && volId) {
                await createElderNode(elderId);
                await createVolunteerNode(volId);
                await createCompanionshipNode(companionshipId, companionship.status, companionship.data);
                await createCompanionshipRelations(elderId, volId, companionshipId);
            }
        } catch (e) {
            console.error('Neo4j acceptCompanionship error:', e);
        }
        res.json(companionship);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// Controller para completar uma companhia.
export const completeCompanionship = async (req: Request, res: Response) => {
    try {
        const companionshipId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

        if (!req.file) {
            return res.status(400).json({ error: "Foto comprovante obrigatoria" });
        }

        const result = await cloudinary.uploader.upload(
            `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
            {
                folder: "uploads/companionships",
            }
        );
        const { foto_comprovante_url } = req.body;

        const companionship = await CompanionshipService.completeCompanionship(
            companionshipId,
            result.secure_url
        );

        if (!companionship) {
            return res.status(404).json({ error: "Companhia não encontrada" });
        }

        if (!companionship) {
            return res.status(404).json({ error: "Companhia não encontrada" });
        }

        // Neo4j
        try {
            await updateCompanionshipStatusNode(companionshipId, companionship.status);
        } catch (e) {
            console.error('Neo4j completeCompanionship error:', e);
        }
        res.json(companionship);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// Controller para atualizar o status de uma companhia.
export const updateCompanionshipStatus = async (req: AuthRequest, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: "status é obrigatório" });
        }

        const companionship = await CompanionshipService.updateCompanionshipStatus(id, status);

        // Neo4j
        try {
            await updateCompanionshipStatusNode(id, status);
        } catch (e) {
            console.error('Neo4j updateCompanionshipStatus error:', e);
        }
        res.json(companionship);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// Controller para obter companhias por usuário (idoso ou voluntário).
export const getCompanionshipsByUser = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const userType = req.user?.papel;

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
