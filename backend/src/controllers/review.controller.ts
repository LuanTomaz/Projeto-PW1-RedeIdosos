import { Request, Response } from "express";
import * as ReviewService from "../services/review.service";
import { z } from "zod";

const reviewSchema = z.object({
    autor_id: z.string(),
    destinatario_id: z.string(),
    tipo: z.enum(['voluntario','idoso']),
    nota: z.number().min(0).max(5),
    comentario: z.string().optional(),
    foto_comprovante_url: z.string().optional()
});

export const createReview = async (req: Request, res: Response) => {
    try {
        const validated = reviewSchema.parse(req.body);
        const review = await ReviewService.createReview({
            ...validated,
            autor_id: validated.autor_id as any,
            destinatario_id: validated.destinatario_id as any,
            data: new Date()
        });
        res.status(201).json(review);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const getReviews = async (req: Request, res: Response) => {
    try {
        const reviews = await ReviewService.getReviews();
        res.json(reviews);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const updateReview = async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const review = await ReviewService.updateReview(id, req.body);
        res.json(review);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const deleteReview = async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        await ReviewService.deleteReview(id);
        res.status(204).send();
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};
