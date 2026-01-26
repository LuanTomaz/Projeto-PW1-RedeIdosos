import mongoose, { Schema, Document } from "mongoose";

export interface IFile extends Document {
    entidade_tipo: string; // "user", "elder", "volunteer", "companionship", "ong", "review"
    entidade_id: mongoose.Types.ObjectId;
    url_arquivo: string;
    tipo_mime: string; // "image/jpeg", "image/png", "application/pdf", etc
    tamanho: number; // em bytes
    usuario_id: mongoose.Types.ObjectId;
    data_upload: Date;
}

const FileSchema: Schema = new Schema({
    entidade_tipo: { type: String, required: true },
    entidade_id: { type: Schema.Types.ObjectId, required: true },
    url_arquivo: { type: String, required: true },
    tipo_mime: { type: String, required: true },
    tamanho: { type: Number, required: true },
    usuario_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    data_upload: { type: Date, default: Date.now }
}, { timestamps: true });

export const File = mongoose.model<IFile>("File", FileSchema);
