import mongoose, { Schema, Document } from "mongoose";

export interface IElder extends Document {
    usuario_id: mongoose.Types.ObjectId;
    endereco: string;
    localizacao: {
        type: "Point" | string,
        coordinates: [number, number] // [lng, lat]
    }
    data_nascimento: Date;
    necessidades_especiais?: string;
}

const ElderSchema: Schema = new Schema({
    usuario_id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    endereco: {
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
    data_nascimento: {
        type: Date,
        required: true
    },
    necessidades_especiais: {
        type: String
    }
}, { timestamps: true });

export const Elder = mongoose.model<IElder>("Elder", ElderSchema);
