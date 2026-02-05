import { Request, Response } from "express";
import { Ong } from "../models/Ong";
import * as ReportService from "../services/report.service";
import { Companionship } from "../models/Companionship";

export const getPublicOngs = async (req: Request, res: Response) => {
    try {
        const ongs = await Ong.find({ ativo: true }, "nome cnpj telefone responsavel foto_url localizacao");
        res.json(ongs);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getPublicImpactReport = async (req: Request, res: Response) => {
    try {
        const impact = await ReportService.generateImpactReport();
        res.json(impact);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getPublicCompanionshipsMap = async (req: Request, res: Response) => {
    try {
        const items = await Companionship.find(
            { status: "concluida" },
            "localizacao status data hora local_descricao"
        );
        res.json(items);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
