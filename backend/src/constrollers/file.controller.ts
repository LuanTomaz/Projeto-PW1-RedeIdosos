import { Request, Response } from "express";
import * as FileService from "../services/file.service";
import { z } from "zod";

const uploadFileSchema = z.object({
    entidade_tipo: z.string(),
    entidade_id: z.string(),
});

export interface FileRequest extends Request {
    file?: Express.Multer.File;
    user?: any;
}

export const uploadFile = async (req: FileRequest, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Nenhum arquivo foi enviado" });
        }

        const { entidade_tipo, entidade_id } = uploadFileSchema.parse(req.body);
        const usuario_id = req.user?.id;

        if (!usuario_id) {
            return res.status(401).json({ error: "Usuário não autenticado" });
        }

        const file = await FileService.uploadFile({
            entidade_tipo,
            entidade_id: entidade_id as any,
            url_arquivo: req.file.path,
            tipo_mime: req.file.mimetype,
            tamanho: req.file.size,
            usuario_id: usuario_id as any,
        });

        res.status(201).json({
            message: "Arquivo enviado com sucesso",
            file: {
                id: file._id,
                url: file.url_arquivo,
                tamanho: file.tamanho,
                tipo_mime: file.tipo_mime,
            },
        });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const getFilesByEntity = async (req: Request, res: Response) => {
    try {
        const entidade_tipo = Array.isArray(req.params.entidade_tipo) ? req.params.entidade_tipo[0] : req.params.entidade_tipo;
        const entidade_id = Array.isArray(req.params.entidade_id) ? req.params.entidade_id[0] : req.params.entidade_id;
        const files = await FileService.getFilesByEntity(entidade_tipo, entidade_id);
        res.json(files);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getFileById = async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const file = await FileService.getFileById(id);

        if (!file) {
            return res.status(404).json({ error: "Arquivo não encontrado" });
        }

        res.json(file);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const downloadFile = async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const file = await FileService.getFileById(id);

        if (!file) {
            return res.status(404).json({ error: "Arquivo não encontrado" });
        }

        res.download(file.url_arquivo);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteFile = async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        await FileService.deleteFile(id);
        res.status(204).send();
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const getFilesByUser = async (req: FileRequest, res: Response) => {
    try {
        const usuario_id = req.user?.id;

        if (!usuario_id) {
            return res.status(401).json({ error: "Usuário não autenticado" });
        }

        const files = await FileService.getFilesByUser(usuario_id);
        res.json(files);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
