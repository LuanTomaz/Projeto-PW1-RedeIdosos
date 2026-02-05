import { Request, Response } from "express";
import * as ElderService from "../services/elder.service";
import * as UserService from "../services/user.service";
import { z } from "zod";
import mongoose from "mongoose";
import { deleteNodeById } from "../neo4j/utils/delete";

interface AuthRequest extends Request {
    user?: any;
}

const elderSchema = z.object({
    usuario_id: z.string(),
    endereco: z.string(),
    localizacao: z.object({
        type: z.literal("Point"),
        coordinates: z.tuple([
            z.number(), // latitude
            z.number(), // longitude
        ]),
    }),
    data_nascimento: z.string(),
    necessidades_especiais: z.string().optional()
});

// Rota desativada para evitar criaÃ§Ã£o manual de idosos
// export const createElder = async (req: Request, res: Response) => {
//     try {
//         const validated = elderSchema.parse(req.body);
//         const elder = await ElderService.createElder({
//             ...validated,
//             usuario_id: validated.usuario_id as any,
//             localizacao: validated.localizacao,
//             data_nascimento: new Date(validated.data_nascimento)
//         });
//         res.status(201).json(elder);
//     } catch (err: any) {
//         res.status(400).json({ error: err.message });
//     }
// };

// Controlador para obter todos os idosos
export const getElders = async (req: Request, res: Response) => {
    try {
        const elders = await ElderService.getElders();
        res.json(elders);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// Controlador para atualizar um idoso pelo ID
export const updateElder = async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const elder = await ElderService.updateElder(id, req.body);
        res.json(elder);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// Controlador para deletar um idoso e o usuÃ¡rio relacionado pelo ID do idoso
export const deleteElderController = async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "ID invÃ¡lido" });
        }

        const elder = await ElderService.getElderById(id);
        if (!elder) {
            return res.status(404).json({ error: "Idoso nÃ£o encontrado" });
        }

        const userId = elder.usuario_id._id?.toString();

        // Deletar o idoso
        await ElderService.deleteElder(id);

        // Neo4j: remove node do perfil
        await deleteNodeById('Elder', id);

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
            message: "Idoso e usuÃ¡rio deletados (ou idoso deletado, se houve problema no usuÃ¡rio).",
            elderId: id,
            userId
        });

    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
};

// Controller para obter o perfil do idoso autenticado
export const getMyProfile = async (req: AuthRequest, res: Response) => {
    try {
        const usuario_id = req.user?.id;

        if (!usuario_id) {
            return res.status(401).json({ error: "UsuÃ¡rio nÃ£o autenticado" });
        }

        const elder = await ElderService.getElderByUserId(usuario_id);
        if (!elder) {
            return res.status(404).json({ error: "Perfil de idoso nÃ£o encontrado" });
        }

        res.json(elder);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// Controller para atualizar o perfil do idoso autenticado
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
            ...elderPayload
        } = req.body ?? {};

        const userUpdates: Record<string, unknown> = {};
        if (rg) userUpdates.rg = rg;
        if (cpf) userUpdates.cpf = cpf;
        if (comprovante_residencia_url) userUpdates.comprovante_residencia_url = comprovante_residencia_url;
        if (foto_perfil_url) userUpdates.foto_perfil_url = foto_perfil_url;

        if (Object.keys(userUpdates).length > 0) {
            await UserService.updateUser(usuario_id, userUpdates);
        }

        const elder = await ElderService.updateElderByUserId(usuario_id, elderPayload);
        res.json(elder);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// Controller para atualizar a localizaÃ§Ã£o do idoso autenticado
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

        const elder = await ElderService.updateElderByUserId(usuario_id, updateData);
        res.json(elder);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};
