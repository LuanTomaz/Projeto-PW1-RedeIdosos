import mongoose, { Schema, Document } from "mongoose";

export interface IReport extends Document {
    tipo: string; // "summary", "statistics", "impact", "locations", "elders", "customizado"
    dados: any; // Dados genéricos do relatório (pode ser JSON)
    gerado_em: Date;
    usuario_id: mongoose.Types.ObjectId;
    data_inicio?: Date;
    data_fim?: Date;
    descricao?: string;
}

const ReportSchema: Schema = new Schema({
    tipo: {
        type: String,
        required: true
    },
    dados: {
        type: Schema.Types.Mixed,
        required: true
    },
    gerado_em: {
        type: Date,
        default: Date.now
    },
    usuario_id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    data_inicio: {
        type: Date
    },
    data_fim: {
        type: Date
    },
    descricao: {
        type: String
    }
}, { timestamps: true });

export const Report = mongoose.model<IReport>("Report", ReportSchema);
