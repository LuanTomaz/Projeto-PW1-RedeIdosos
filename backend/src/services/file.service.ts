import { File, IFile } from "../models/File";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.join(__dirname, "../../uploads");

// Garantir que o diretório de uploads existe
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const uploadFile = async (data: Partial<IFile>) => {
    const file = new File(data);
    return await file.save();
};

export const getFilesByEntity = async (entidade_tipo: string, entidade_id: string) => {
    return await File.find({ entidade_tipo, entidade_id }).populate("usuario_id", "nome email");
};

export const getFileById = async (id: string) => {
    return await File.findById(id).populate("usuario_id", "nome email");
};

export const getFilesByUser = async (usuario_id: string) => {
    return await File.find({ usuario_id }).populate("usuario_id", "nome email");
};

export const deleteFile = async (id: string) => {
    const file = await File.findByIdAndDelete(id);
    
    // Deletar arquivo do disco
    if (file && fs.existsSync(file.url_arquivo)) {
        fs.unlinkSync(file.url_arquivo);
    }
    
    return file;
};

export const deleteFilesByEntity = async (entidade_tipo: string, entidade_id: string) => {
    const files = await File.find({ entidade_tipo, entidade_id });
    
    // Aqui é para deletar os arquivos do disco
    files.forEach(file => {
        if (fs.existsSync(file.url_arquivo)) {
            fs.unlinkSync(file.url_arquivo);
        }
    });
    
    return await File.deleteMany({ entidade_tipo, entidade_id });
};

export const getUploadPath = () => UPLOAD_DIR;
