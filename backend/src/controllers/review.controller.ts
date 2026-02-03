import { Request, Response } from "express";
import * as ReviewService from "../services/review.service";
import { z } from "zod";
import cloudinary from "../config/cloudinary";

interface AuthRequest extends Request {
    user?: any;
}

// Esquema de validação para o review
const reviewSchema = z.object({
    destinatario_id: z.string(),
    tipo: z.enum(['voluntario', 'idoso']),
    nota: z.coerce.number().min(0).max(5),
    comentario: z.string().optional(),
    foto_comprovante_url: z.string().optional()
});

// Controlador para criar um novo review
export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const validated = reviewSchema.parse(req.body);

    const usuario_id = req.user?.id;
    if (!usuario_id) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    let fotoUrl: string | undefined;

    if (req.file) {
      const base64 = req.file.buffer.toString("base64");
      const dataUri = `data:${req.file.mimetype};base64,${base64}`;

      const uploadResult = await cloudinary.uploader.upload(dataUri, {
        folder: "reviews"
      });

      fotoUrl = uploadResult.secure_url;
    }

    const review = await ReviewService.createReview({
      ...validated,
      autor_id: usuario_id as any,
      destinatario_id: validated.destinatario_id as any,
      data: new Date(),
      foto_comprovante_url: fotoUrl
    });

    return res.status(201).json(review);
  } catch (err: any) {
    console.error(err);
    return res.status(400).json({ error: err.message });
  }
};

// Controlador para obter todos os reviews
export const getReviews = async (req: Request, res: Response) => {
    try {
        const reviews = await ReviewService.getReviews();
        res.json(reviews);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// Controlador para atualizar um review
export const updateReview = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    let fotoUrl: string | undefined;

    // Se veio uma nova foto, faz upload
    if (req.file) {
      const base64 = req.file.buffer.toString("base64");
      const dataUri = `data:${req.file.mimetype};base64,${base64}`;

      const uploadResult = await cloudinary.uploader.upload(dataUri, {
        folder: "reviews"
      });

      fotoUrl = uploadResult.secure_url;
    }

    const dadosAtualizados = {
      ...req.body,
      ...(fotoUrl && { foto_comprovante_url: fotoUrl })
    };

    const review = await ReviewService.updateReview(id, dadosAtualizados);

    res.json(review);
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Controlador para deletar um review
export const deleteReview = async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        await ReviewService.deleteReview(id);
        return res.status(200).json({
            success: true,
            message: "Review deletado com sucesso.",
            reviewId: id,
        });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};
