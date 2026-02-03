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
import { authorize } from "../middlewares/authorization.middleware";

const router = Router();

// Rota para obter todos os relatórios
router.get(
    "/all-reports", 
    verifyToken, 
    authorize('admin'),
    getReports
);

// Rota para obter relatórios do usuário autenticado
router.get(
    "/my-reports", 
    verifyToken, 
    getReportsByUser
);

// Rota para criar um novo relatório
router.post(
    "/create-report", 
    verifyToken, 
    createReport
);

// Rota para obter um relatório por ID
router.get(
    "/:id/report", 
    verifyToken,
    authorize('admin'), 
    getReportById
);

// Rota para atualizar um relatório por ID
router.put(
    "/:id/update-report", 
    verifyToken,
    authorize('admin'), 
    updateReport
);

// Rota para deletar um relatório por ID
router.delete(
    "/:id/delete-report", 
    verifyToken, 
    authorize('admin'),
    deleteReport
);

// Filtros
router.get(
    "/type/:tipo", 
    verifyToken, 
    getReportsByType
);

// Relatórios Dinâmicos, por enquanto desativados
// router.get("/generate/summary", verifyToken, generateSummaryReport);
// router.get("/generate/statistics", verifyToken, generateStatisticsReport);
// router.get("/generate/impact", generateImpactReport); // Público
// router.get("/generate/locations", verifyToken, generateLocationsReport);
// router.get("/generate/elders", verifyToken, generateEldersReport);



export default router;
