import { Router } from "express";
import multer from "multer";
import path from "path";
import { 
    uploadFile, 
    getFilesByEntity, 
    getFileById, 
    downloadFile, 
    deleteFile,
    getFilesByUser 
} from "../constrollers/file.controller";
import { verifyToken } from "../middlewares/auth_middleware";

const router = Router();

// Configurar multer para upload de arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, "../../uploads");
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Aceitar apenas imagens e documentos
    const allowedMimes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Tipo de arquivo não permitido"));
    }
};

//Limite de 10mb
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } 
});

// Rotas
router.post("/", verifyToken, upload.single("file"), uploadFile);
router.get("/entity/:entidade_tipo/:entidade_id", getFilesByEntity);
router.get("/me", verifyToken, getFilesByUser);
router.get("/:id", getFileById);
router.get("/:id/download", downloadFile);
router.delete("/:id", verifyToken, deleteFile);

export default router;
