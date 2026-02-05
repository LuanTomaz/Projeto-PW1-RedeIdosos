import { Router } from "express";
import {
    getPublicOngs,
    getPublicImpactReport,
    getPublicCompanionshipsMap
} from "../controllers/public.controller";

const router = Router();

router.get("/ongs", getPublicOngs);
router.get("/reports/impact", getPublicImpactReport);
router.get("/map/companionships", getPublicCompanionshipsMap);

export default router;
