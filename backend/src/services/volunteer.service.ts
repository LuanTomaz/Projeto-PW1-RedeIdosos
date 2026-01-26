import { Volunteer, IVolunteer } from "../models/Volunteer";

export const createVolunteer = async (data: Partial<IVolunteer>) => {
    const volunteer = new Volunteer(data);
    return await volunteer.save();
};

export const getVolunteers = async () => {
    return await Volunteer.find().populate("usuario_id");
};

export const getVolunteerById = async (id: string) => {
    return await Volunteer.findById(id).populate("usuario_id");
};

export const updateVolunteer = async (id: string, data: Partial<IVolunteer>) => {
    return await Volunteer.findByIdAndUpdate(id, data, { new: true });
};

export const deleteVolunteer = async (id: string) => {
    return await Volunteer.findByIdAndDelete(id);
};

export const getVolunteerByUserId = async (usuario_id: string) => {
    return await Volunteer.findOne({ usuario_id }).populate("usuario_id");
};

export const updateVolunteerByUserId = async (usuario_id: string, data: Partial<IVolunteer>) => {
    return await Volunteer.findOneAndUpdate({ usuario_id }, data, { new: true }).populate("usuario_id");
};
