import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    nome: string;
    email: string;
    senha_hash: string;
    papel: 'pending' | 'admin' | 'gestor_publico' | 'ong' | 'voluntario' | 'idoso';
    tipo_cadastro: 'idoso' | 'voluntario' | 'ong';
    telefone?: string;
    foto_perfil_url?: string;
    verificado: boolean;
    ativo: boolean;
}

const UserSchema: Schema = new Schema({
    nome: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    senha_hash: {
        type: String,
        required: true
    },
    papel: {
        type: String,
        enum: ['pending', 'admin', 'gestor_publico', 'ong', 'voluntario', 'idoso'],
        required: true
    },
    tipo_cadastro: {
        type: String,
        enum: ["idoso", "voluntario", "ong"],
        required: true,
    },
    telefone: {
        type: String
    },
    foto_perfil_url: {
        type: String
    },
    verificado: {
        type: Boolean, default: false
    },
    ativo: {
        type: Boolean, default: true
    },
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', UserSchema);
