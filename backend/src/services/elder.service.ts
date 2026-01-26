import { Elder, IElder } from "../models/Elder";

export const createElder = async (data: Partial<IElder>) => {
    const elder = new Elder(data);
    return await elder.save();
};

export const getElders = async () => {
    return await Elder.find().populate("usuario_id");
};

export const getElderById = async (id: string) => {
    return await Elder.findById(id).populate("usuario_id");
};

export const updateElder = async (id: string, data: Partial<IElder>) => {
    return await Elder.findByIdAndUpdate(id, data, { new: true });
};

export const deleteElder = async (id: string) => {
    return await Elder.findByIdAndDelete(id);
};
