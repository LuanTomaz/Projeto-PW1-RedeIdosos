import { Router } from "express";
import {
    createReport,
    getReports,
    getReportById,
    updateReport,
    deleteReport,
    generateSummaryReport,
    generateStatisticsReport,
    generateImpactReport,
    generateLocationsReport,
    generateEldersReport,
    getReportsByType,
    getReportsByUser
} from "../controllers/report.controller";
import { verifyToken } from "../middlewares/auth_middleware";

const router = Router();

router.get("/", verifyToken, getReports);
router.get("/me", verifyToken, getReportsByUser);
router.post("/", verifyToken, createReport);
router.get("/:id", verifyToken, getReportById);
router.put("/:id", verifyToken, updateReport);
router.delete("/:id", verifyToken, deleteReport);

// Relatórios Dinâmicos
router.get("/generate/summary", verifyToken, generateSummaryReport);
router.get("/generate/statistics", verifyToken, generateStatisticsReport);
router.get("/generate/impact", generateImpactReport); // Público
router.get("/generate/locations", verifyToken, generateLocationsReport);
router.get("/generate/elders", verifyToken, generateEldersReport);

// Filtros
router.get("/type/:tipo", verifyToken, getReportsByType);

export default router;
