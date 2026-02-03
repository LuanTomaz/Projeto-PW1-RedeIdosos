import { Router } from "express";
import { createReview, getReviews, updateReview, deleteReview } from "../controllers/review.controller";
import { verifyToken } from "../middlewares/auth_middleware";
import { upload } from "../middlewares/upload";
import { requireActiveUser } from "../middlewares/status";

const router = Router();

// Rota ver todos os reviews 
router.get(
    "/view-reviews", 
    verifyToken, 
    requireActiveUser,
    getReviews
);

// Rota para criar um novo review
router.post(
    "/create-review", 
    verifyToken, 
    upload.single("foto"),
    requireActiveUser,
    createReview
);

// Rota para atualizar um review
router.put(
    "/:id/update-review", 
    verifyToken,
    upload.single("foto"),
    requireActiveUser,
    updateReview
);

// Rota para deletar um review
router.delete(
    "/:id/delete-review", 
    verifyToken, 
    requireActiveUser,
    deleteReview
);

export default router;
