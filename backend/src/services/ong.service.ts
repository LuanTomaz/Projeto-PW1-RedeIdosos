import { Ong, IOng } from "../models/Ong";

export const createOng = async (data: Partial<IOng>) => {
    const ong = new Ong(data);
    return await ong.save();
};

export const getOngs = async () => {
    return await Ong.find().populate("usuario_id");
};

export const getOngById = async (id: string) => {
    return await Ong.findById(id).populate("usuario_id");
};

export const updateOng = async (id: string, data: Partial<IOng>) => {
    return await Ong.findByIdAndUpdate(id, data, { new: true });
};

export const deleteOng = async (id: string) => {
    return await Ong.findByIdAndDelete(id);
};
