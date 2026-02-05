import { Request, Response } from "express";
import * as OngService from "../services/ong.service";
import * as UserService from "../services/user.service";
import { z } from "zod";
import mongoose from "mongoose";
import { deleteNodeById } from "../neo4j/utils/delete";

interface AuthRequest extends Request {
    user?: any;
}

// Esquema de validaÃ§Ã£o para criaÃ§Ã£o/atualizaÃ§Ã£o de ONG
const ongSchema = z.object({
    usuario_id: z.string(),
    nome: z.string(),
    cnpj: z.string(),
    telefone: z.string().optional(),
    responsavel: z.string().optional(),
    foto_url: z.string().optional(),
    localizacao: z.object({
        type: z.literal("Point"),
        coordinates: z.tuple([
            z.number(), // latitude
            z.number(), // longitude
        ]),
    }),
    ativo: z.boolean().optional()
});

// Controlador para criar uma nova ONG
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


// Controlador para obter todas as ONGs
export const getOngs = async (req: Request, res: Response) => {
    try {
        const idParam = req.query.id;
        const id =
            typeof idParam === "string"
                ? idParam
                : Array.isArray(idParam) && typeof idParam[0] === "string"
                ? idParam[0]
                : undefined;

        if (id) {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ error: "ID invÃƒÂ¡lido" });
            }

            const ong = await OngService.getOngById(id);
            if (!ong) {
                return res.status(404).json({ error: "ONG nÃƒÂ£o encontrada" });
            }
            return res.json(ong);
        }

        const ongs = await OngService.getOngs();
        res.json(ongs);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// Controlador para atualizar uma ONG pelo ID
export const updateOng = async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const ong = await OngService.updateOng(id, req.body);
        res.json(ong);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// Controlador para deletar uma ONG pelo ID
export const deleteOng = async (req: Request, res: Response) => {
    try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ error: "ID invÃ¡lido" });
            }
    
            const ong = await OngService.getOngById(id);
            if (!ong) {
                return res.status(404).json({ error: "ONG nÃ£o encontrada" });
            }
    
            const userId = ong.usuario_id._id?.toString();
    
            // Deletar o idoso
            await OngService.deleteOng(id);

            // Neo4j: remove node do perfil
            await deleteNodeById('Ong', id);
    
            // Deletar o usuÃ¡rio relacionado
            if (userId) {
                try {
                    await UserService.deleteUser(userId);

                    // Neo4j: remove node do usuario
                    await deleteNodeById('User', userId);
                } catch (err) {
                    console.error("Erro ao deletar o usuÃ¡rio:", err);
                }
            }
    
            return res.status(200).json({
                success: true,
                message: "ONG e usuÃ¡rio deletados (ou ONG deletada, se houve problema no usuÃ¡rio).",
                ongId: id,
                userId
            });
    
        } catch (err: any) {
            console.error(err);
            res.status(500).json({ error: "Erro interno do servidor" });
        }
};

// Controlador para obter o perfil da ONG autenticada
export const getMyProfile = async (req: AuthRequest, res: Response) => {
    try {
        const usuario_id = req.user?.id;

        if (!usuario_id) {
            return res.status(401).json({ error: "UsuÃ¡rio nÃ£o autenticado" });
        }

        const ong = await OngService.getOngByUserId(usuario_id);
        if (!ong) {
            return res.status(404).json({ error: "Perfil de ONG nÃ£o encontrado" });
        }

        res.json(ong);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// Controlador para atualizar o perfil da ONG autenticada
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
            ...ongPayload
        } = req.body ?? {};

        const userUpdates: Record<string, unknown> = {};
        if (rg) userUpdates.rg = rg;
        if (cpf) userUpdates.cpf = cpf;
        if (comprovante_residencia_url) userUpdates.comprovante_residencia_url = comprovante_residencia_url;
        if (foto_perfil_url) userUpdates.foto_perfil_url = foto_perfil_url;

        if (Object.keys(userUpdates).length > 0) {
            await UserService.updateUser(usuario_id, userUpdates);
        }

        const ong = await OngService.updateOngByUserId(usuario_id, ongPayload);
        res.json(ong);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// Controlador para atualizar a localizaÃ§Ã£o da ONG autenticada
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

        const ong = await OngService.updateOngByUserId(usuario_id, updateData);
        res.json(ong);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};
