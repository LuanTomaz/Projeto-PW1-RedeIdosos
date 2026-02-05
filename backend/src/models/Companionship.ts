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
    foto_solicitacao_url?: string;
    foto_comprovante_url?: string;
    inicio_companhia?: Date;
    fim_companhia?: Date;
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
    foto_solicitacao_url: { type: String },
    foto_comprovante_url: { type: String },
    inicio_companhia: { type: Date },
    fim_companhia: { type: Date }
}, { timestamps: true });

CompanionshipSchema.index({ localizacao: "2dsphere" });

export const Companionship = mongoose.model<ICompanionship>("Companionship", CompanionshipSchema);
