import { Request, Response } from "express";
import * as CompanionshipService from "../services/companionship.service";
import * as ElderService from "../services/elder.service";
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
    idoso_id: z.string().optional(),
    voluntario_id: z.string().optional(),
    atividade: z.string(),
    descricao: z.string().optional(),
    data: z.string(),
    hora: z.string(),
    localizacao: z.object({
        type: z.literal("Point"),
        coordinates: z.tuple([
            z.coerce.number(), // latitude
            z.coerce.number(), // longitude
        ]),
    }),
    local_descricao: z.string().optional(),
    status: z.enum(['pendente', 'aceita', 'em_andamento', 'concluida', 'cancelada']).optional(),
    foto_solicitacao_url: z.string().optional(),
    foto_comprovante_url: z.string().optional()
});

// Controller para criar uma nova companhia.
export const createCompanionship = async (req: Request, res: Response) => {
    try {
        const payload = { ...(req.body ?? {}) } as Record<string, any>;
        if (typeof payload.localizacao === "string") {
            try {
                payload.localizacao = JSON.parse(payload.localizacao);
            } catch {
                // ignore JSON parse errors and let zod handle invalid payloads
            }
        }
        const validated = companionshipSchema.parse(payload);
        const userRole = (req as AuthRequest).user?.papel;
        const userId = (req as AuthRequest).user?.id;
        let idosoId = validated.idoso_id;
        let fotoSolicitacaoUrl = validated.foto_solicitacao_url;

        if (userRole === "idoso" && userId) {
            const elder = await ElderService.getElderByUserId(userId);
            if (!elder) {
                return res.status(400).json({ error: "Perfil de idoso nÃƒÂ£o encontrado" });
            }
            idosoId = elder._id.toString();
        }

        if (!idosoId) {
            return res.status(400).json({ error: "idoso_id ÃƒÂ© obrigatÃƒÂ³rio" });
        }

        if (req.file) {
            const result = await cloudinary.uploader.upload(
                `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
                { folder: "uploads/companionships" }
            );
            fotoSolicitacaoUrl = result.secure_url;
        }

        const companionship = await CompanionshipService.createCompanionship({
            ...validated,
            idoso_id: idosoId as any,
            voluntario_id: validated.voluntario_id as any,
            data: new Date(validated.data),
            foto_solicitacao_url: fotoSolicitacaoUrl
        });

        // Neo4j
        const companionshipId = companionship._id.toString();
        await createCompanionshipNode(companionshipId, companionship.status, companionship.data);
        await createElderNode(idosoId);
        if (validated.voluntario_id) {
            await createVolunteerNode(validated.voluntario_id);
            await createCompanionshipRelations(idosoId, validated.voluntario_id, companionshipId);
        } else {
            await createElderRequestCompanionship(idosoId, companionshipId);
        }
        res.status(201).json(companionship);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// Controller para listar as companhias.
export const getCompanionships = async (req: Request, res: Response) => {
    try {
        const lat = typeof req.query.lat === "string" ? Number(req.query.lat) : undefined;
        const lng = typeof req.query.lng === "string" ? Number(req.query.lng) : undefined;
        const maxDistanceKm =
            typeof req.query.maxDistanceKm === "string"
                ? Number(req.query.maxDistanceKm)
                : typeof req.query.radius === "string"
                ? Number(req.query.radius)
                : undefined;

        const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
        const companionships = await CompanionshipService.getCompanionships(
            hasCoords
                ? {
                      lat: lat as number,
                      lng: lng as number,
                      maxDistanceKm: Number.isFinite(maxDistanceKm) ? (maxDistanceKm as number) : undefined,
                  }
                : undefined
        );
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
        if (!companionship) {
            return res.status(404).json({ error: "Companhia nao encontrada" });
        }
        res.json(companionship);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// Controller para deletar uma companhia.
export const deleteCompanionship = async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const deleted = await CompanionshipService.deleteCompanionship(id);
        if (!deleted) {
            return res.status(404).json({ error: "Companhia nao encontrada" });
        }

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
            const elderId =
                (companionship as any).idoso_id?._id?.toString?.() ??
                String((companionship as any).idoso_id);
            const volId =
                (companionship as any).voluntario_id?._id?.toString?.() ??
                String((companionship as any).voluntario_id);
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
        const companionship = await CompanionshipService.completeCompanionship(
            companionshipId,
            result.secure_url
        );

        if (!companionship) {
            return res.status(404).json({ error: "Companhia nao encontrada" });
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
        if (!companionship) {
            return res.status(404).json({ error: "Companhia nao encontrada" });
        }

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

// Controller para obter uma companhia por ID.
export const getCompanionshipById = async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const companionship = await CompanionshipService.getCompanionshipById(id);
        if (!companionship) {
            return res.status(404).json({ error: "Companhia nao encontrada" });
        }
        res.json(companionship);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// Controller para ONG associar voluntario a uma solicitacao.
export const matchCompanionship = async (req: AuthRequest, res: Response) => {
    try {
        const { companionship_id, voluntario_id } = req.body ?? {};

        if (!companionship_id || !voluntario_id) {
            return res.status(400).json({ error: "companionship_id e voluntario_id sao obrigatorios" });
        }

        const companionship = await CompanionshipService.assignVolunteerToCompanionship(
            companionship_id,
            voluntario_id
        );

        if (!companionship) {
            return res.status(404).json({ error: "Companhia nao encontrada" });
        }

        res.json(companionship);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};



