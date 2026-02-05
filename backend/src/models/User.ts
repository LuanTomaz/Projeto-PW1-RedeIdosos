import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    nome: string;
    email: string;
    senha: string;
    papel: 'pending' | 'admin' | 'ong' | 'voluntario' | 'idoso';
    tipo_cadastro: 'idoso' | 'voluntario' | 'ong';
    telefone?: string;
    foto_perfil_url?: string;
    rg?: string;
    cpf?: string;
    comprovante_residencia_url?: string;
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
    senha: {
        type: String,
        required: true
    },
    papel: {
        type: String,
        enum: ['pending', 'admin', 'ong', 'voluntario', 'idoso'],
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
    rg: {
        type: String
    },
    cpf: {
        type: String
    },
    comprovante_residencia_url: {
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
