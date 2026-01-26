import mongoose, { Schema, Document } from "mongoose";

export interface IOng extends Document {
    usuario_id: mongoose.Types.ObjectId;
    nome: string;
    cnpj: string;
    telefone?: string;
    responsavel?: string;
    foto_url?: string;
    latitude?: number;
    longitude?: number;
    ativo: boolean;
}

const OngSchema: Schema = new Schema({
    usuario_id: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    nome: { type: String, required: true },
    cnpj: { type: String, required: true },
    telefone: { type: String },
    responsavel: { type: String },
    foto_url: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    ativo: { type: Boolean, default: true }
}, { timestamps: true });

export const Ong = mongoose.model<IOng>("Ong", OngSchema);
