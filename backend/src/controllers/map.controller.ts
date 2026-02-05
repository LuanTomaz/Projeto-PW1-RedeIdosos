import { Request, Response } from "express";
import { Companionship } from "../models/Companionship";
import { Elder } from "../models/Elder";
import { Volunteer } from "../models/Volunteer";
import * as CompanionshipService from "../services/companionship.service";

interface AuthRequest extends Request {
    user?: any;
}

export const getCompanionshipsMap = async (req: Request, res: Response) => {
    try {
        const status = typeof req.query.status === "string" ? req.query.status : undefined;
        const filtro = status ? { status } : {};
        const items = await Companionship.find(filtro, "localizacao status data hora local_descricao");
        res.json(items);
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

export const getEldersMap = async (req: Request, res: Response) => {
    try {
        const elders = await Elder.find({}, "localizacao");
        res.json(elders);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getVolunteersMap = async (req: Request, res: Response) => {
    try {
        const volunteers = await Volunteer.find({}, "localizacao");
        res.json(volunteers);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getCompanionshipsNearby = async (req: Request, res: Response) => {
    try {
        const lat = typeof req.query.lat === "string" ? Number(req.query.lat) : undefined;
        const lng = typeof req.query.lng === "string" ? Number(req.query.lng) : undefined;
        const maxDistanceKm =
            typeof req.query.maxDistanceKm === "string"
                ? Number(req.query.maxDistanceKm)
                : typeof req.query.radius === "string"
                ? Number(req.query.radius)
                : undefined;

        const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
        if (!hasCoords) {
            return res.status(400).json({ error: "lat e lng sao obrigatorios" });
        }

        const companionships = await CompanionshipService.getCompanionships({
            lat: lat as number,
            lng: lng as number,
            maxDistanceKm: Number.isFinite(maxDistanceKm) ? (maxDistanceKm as number) : undefined,
        });
        res.json(companionships);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getMyCompanionshipsMap = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const userType = req.user?.papel;
        if (!userId) {
            return res.status(401).json({ error: "Usuario nao autenticado" });
        }
        if (!userType || (userType !== "idoso" && userType !== "voluntario")) {
            return res.status(400).json({ error: "userType deve ser idoso ou voluntario" });
        }

        const companionships = await CompanionshipService.getCompanionshipsByUser(
            userId,
            userType as "idoso" | "voluntario"
        );
        const mapa = companionships.map((item: any) => ({
            _id: item._id,
            localizacao: item.localizacao,
            status: item.status,
            data: item.data,
            hora: item.hora,
        }));
        res.json(mapa);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
