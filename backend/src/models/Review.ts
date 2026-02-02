import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
    autor_id: mongoose.Types.ObjectId;
    destinatario_id: mongoose.Types.ObjectId;
    tipo: 'voluntario' | 'idoso';
    nota: number;
    comentario?: string;
    data: Date;
    foto_comprovante_url?: string;
}

const ReviewSchema: Schema = new Schema({
    autor_id: {
        type: Schema.Types.ObjectId,
        ref: "User", required: true
    },
    destinatario_id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    tipo: {
        type: String,
        enum: ['voluntario', 'idoso'],
        required: true
    },
    nota: {
        type: Number,
        required: true
    },
    comentario: {
        type: String
    },
    data: {
        type: Date,
        default: Date.now
    },
    foto_comprovante_url: { type: String }
}, { timestamps: true });

export const Review = mongoose.model<IReview>("Review", ReviewSchema);
