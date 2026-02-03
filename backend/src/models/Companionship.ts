import mongoose, { Schema, Document } from "mongoose";

export interface ICompanionship extends Document {
    idoso_id: mongoose.Types.ObjectId;
    voluntario_id?: mongoose.Types.ObjectId;
    atividade: string;
    descricao?: string;
    data: Date;
    hora: string;
    localizacao: {
        type: "Point" | string,
        coordinates: [number, number] // [lng, lat]
    },
    local_descricao?: string;
    status: 'pendente' | 'aceita' | 'em_andamento' | 'concluida' | 'cancelada';
    foto_comprovante_url?: string;
}

const CompanionshipSchema: Schema = new Schema({
    idoso_id: {
        type: Schema.Types.ObjectId,
        ref: "Elder",
        required: true
    },
    voluntario_id: {
        type: Schema.Types.ObjectId,
        ref: "Volunteer"
    },
    atividade: {
        type: String,
        required: true
    },
    descricao: {
        type: String
    },
    data: {
        type: Date,
        required: true
    },
    hora: {
        type: String,
        required: true
    },
    localizacao: {
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: [
            {
                type:Number,
                required: true
            },
            {
                type: Number,
                required:true
            }
        ]
    },
    local_descricao: { type: String },
    status: {
        type: String,
        enum: ['pendente', 'aceita', 'em_andamento', 'concluida', 'cancelada'],
        default: 'pendente'
    },
    foto_comprovante_url: { type: String }
}, { timestamps: true });

export const Companionship = mongoose.model<ICompanionship>("Companionship", CompanionshipSchema);
