import mongoose, { Schema, Document } from "mongoose";

export interface IVolunteer extends Document {
    usuario_id: mongoose.Types.ObjectId;
    documentos_url?: string[];
    disponibilidade?: string;
    area_atuacao?: string;
    verificado: boolean;
    localizacao: {
        type: "Point" | string,
        coordinates: [number, number] // [lng, lat]
    }

}

const VolunteerSchema: Schema = new Schema({
    usuario_id: {
        type: Schema.Types.ObjectId,
        ref: "User", required: true,
        unique: true
    },
    documentos_url: [{ 
        type: String 
    }],
    disponibilidade: {
        type: String
    },
    area_atuacao: {
        type: String
    },
    verificado: {
        type: Boolean, default: false
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
    }
}, { timestamps: true });

export const Volunteer = mongoose.model<IVolunteer>("Volunteer", VolunteerSchema);
