import mongoose, { Schema, Document } from "mongoose";

export interface IVolunteer extends Document {
    usuario_id: mongoose.Types.ObjectId;
    documentos_url?: string[];
    disponibilidade?: string;
    area_atuacao?: string;
    verificado: boolean;
    latitude?: number;
    longitude?: number;
}

const VolunteerSchema: Schema = new Schema({
    usuario_id: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    documentos_url: [{ type: String }],
    disponibilidade: { type: String },
    area_atuacao: { type: String },
    verificado: { type: Boolean, default: false },
    latitude: { type: Number },
    longitude: { type: Number }
}, { timestamps: true });

export const Volunteer = mongoose.model<IVolunteer>("Volunteer", VolunteerSchema);
