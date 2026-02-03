import { Router } from "express";
import { createReview, getReviews, updateReview, deleteReview } from "../controllers/review.controller";
import { verifyToken } from "../middlewares/auth_middleware";

const router = Router();

router.get("/", verifyToken, getReviews);
router.post("/", verifyToken, createReview);
router.put("/:id", verifyToken, updateReview);
router.delete("/:id", verifyToken, deleteReview);

export default router;
