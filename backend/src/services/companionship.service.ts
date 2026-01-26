import { Companionship, ICompanionship } from "../models/Companionship";

export const createCompanionship = async (data: Partial<ICompanionship>) => {
    const companionship = new Companionship(data);
    return await companionship.save();
};

export const getCompanionships = async () => {
    return await Companionship.find().populate("idoso_id").populate("voluntario_id");
};

export const getCompanionshipById = async (id: string) => {
    return await Companionship.findById(id).populate("idoso_id").populate("voluntario_id");
};

export const updateCompanionship = async (id: string, data: Partial<ICompanionship>) => {
    return await Companionship.findByIdAndUpdate(id, data, { new: true });
};

export const deleteCompanionship = async (id: string) => {
    return await Companionship.findByIdAndDelete(id);
};
