import { Request, Response } from "express";
import * as ReportService from "../services/report.service";
import { z } from "zod";

interface AuthRequest extends Request {
    user?: any;
}

const reportSchema = z.object({
    tipo: z.string(),
    descricao: z.string().optional(),
    data_inicio: z.string().optional(),
    data_fim: z.string().optional()
});

// Controlador para criar um novo relatório
export const createReport = async (req: AuthRequest, res: Response) => {
    try {
        const validated = reportSchema.parse(req.body);
        const usuario_id = req.user?.id;

        if (!usuario_id) {
            return res.status(401).json({ error: "Usuário não autenticado" });
        }

        const report = await ReportService.createReport({
            ...validated,
            usuario_id: usuario_id as any,
            dados: {},
            gerado_em: new Date(),
            data_inicio: validated.data_inicio ? new Date(validated.data_inicio) : undefined,
            data_fim: validated.data_fim ? new Date(validated.data_fim) : undefined
        });

        res.status(201).json(report);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const getReports = async (req: Request, res: Response) => {
    try {
        const reports = await ReportService.getReports();
        res.json(reports);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getReportById = async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const report = await ReportService.getReportById(id);

        if (!report) {
            return res.status(404).json({ error: "Relatório não encontrado" });
        }

        res.json(report);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const updateReport = async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const report = await ReportService.updateReport(id, req.body);
        res.json(report);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const deleteReport = async (req: Request, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        await ReportService.deleteReport(id);
        return res.status(200).json({
            success: true,
            message: "Relatório deletado com sucesso.",
            reportId: id,
        });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// Endpoints de Relatórios Dinâmicos

export const generateSummaryReport = async (req: Request, res: Response) => {
    try {
        const { data_inicio, data_fim, from, to } = req.query;

        const summary = await ReportService.generateSummaryReport(
            (from ?? data_inicio) ? new Date((from ?? data_inicio) as string) : undefined,
            (to ?? data_fim) ? new Date((to ?? data_fim) as string) : undefined
        );

        res.json(summary);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const generateStatisticsReport = async (req: Request, res: Response) => {
    try {
        const statistics = await ReportService.generateStatisticsReport();
        res.json(statistics);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const generateImpactReport = async (req: Request, res: Response) => {
    try {
        const impact = await ReportService.generateImpactReport();
        res.json(impact);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const generateLocationsReport = async (req: Request, res: Response) => {
    try {
        const locations = await ReportService.generateLocationsReport();
        res.json(locations);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const generateEldersReport = async (req: Request, res: Response) => {
    try {
        const elders = await ReportService.generateEldersReport();
        res.json(elders);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getReportsByType = async (req: Request, res: Response) => {
    try {
        const tipo = Array.isArray(req.params.tipo) ? req.params.tipo[0] : req.params.tipo;
        const reports = await ReportService.getReportsByType(tipo);
        res.json(reports);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getReportsByUser = async (req: AuthRequest, res: Response) => {
    try {
        const usuario_id = req.user?.id;
        const fromParam = req.query.from ?? req.query.data_inicio;
        const toParam = req.query.to ?? req.query.data_fim;
        const from = typeof fromParam === "string" ? new Date(fromParam) : undefined;
        const to = typeof toParam === "string" ? new Date(toParam) : undefined;

        if (!usuario_id) {
            return res.status(401).json({ error: "Usuário não autenticado" });
        }

        const reports = await ReportService.getReportsByUser(usuario_id, {
            from: from && !Number.isNaN(from.getTime()) ? from : undefined,
            to: to && !Number.isNaN(to.getTime()) ? to : undefined
        });
        res.json(reports);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

