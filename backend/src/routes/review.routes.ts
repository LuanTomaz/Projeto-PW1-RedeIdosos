import { Router } from "express";
import { createReview, getReviews, updateReview, deleteReview } from "../controllers/review.controller";
import { verifyToken } from "../middlewares/auth_middleware";
import { upload } from "../middlewares/upload";

const router = Router();

// Rota ver todos os reviews 
router.get(
    "/view-reviews", 
    verifyToken, 
    getReviews
);

// Rota para criar um novo review
router.post(
    "/create-review", 
    verifyToken, 
    upload.single("foto"),
    createReview
);

// Rota para atualizar um review
router.put(
    "/:id/update-review", 
    verifyToken,
    upload.single("foto"),
    updateReview
);

// Rota para deletar um review
router.delete(
    "/:id/delete-review", 
    verifyToken, 
    deleteReview
);

export default router;
