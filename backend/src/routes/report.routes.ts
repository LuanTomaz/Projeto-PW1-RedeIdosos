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
import { requireActiveUser } from "../middlewares/status";

const router = Router();

// Rota para obter todos os relatórios
router.get(
    "/all-reports", 
    verifyToken, 
    authorize('admin'),
    requireActiveUser,
    getReports
);

// Rota para obter relatórios do usuário autenticado
router.get(
    "/my-reports", 
    verifyToken, 
    requireActiveUser,
    getReportsByUser
);

// Rota para criar um novo relatório
router.post(
    "/create-report", 
    verifyToken, 
    requireActiveUser,
    createReport
);

// Rota para obter um relatório por ID
router.get(
    "/:id/report", 
    verifyToken,
    authorize('admin'), 
    requireActiveUser,
    getReportById
);

// Rota para atualizar um relatório por ID
router.put(
    "/:id/update-report", 
    verifyToken,
    authorize('admin'), 
    requireActiveUser,
    updateReport
);

// Rota para deletar um relatório por ID
router.delete(
    "/:id/delete-report", 
    verifyToken, 
    authorize('admin'),
    requireActiveUser,
    deleteReport
);

// Filtros
router.get(
    "/type/:tipo", 
    verifyToken, 
    requireActiveUser,
    getReportsByType
);

// Relatórios Dinâmicos, por enquanto desativados
router.get(
    "/summary",
    verifyToken,
    authorize("admin"),
    requireActiveUser,
    generateSummaryReport
);

router.get(
    "/statistics",
    verifyToken,
    authorize("admin"),
    requireActiveUser,
    generateStatisticsReport
);

router.get(
    "/locations",
    verifyToken,
    authorize("admin"),
    requireActiveUser,
    generateLocationsReport
);

router.get(
    "/elders",
    verifyToken,
    authorize("admin"),
    requireActiveUser,
    generateEldersReport
);



export default router;
