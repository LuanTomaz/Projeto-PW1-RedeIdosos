import { User, IUser } from "../models/User";
import bcrypt from "bcryptjs";

export const createUser = async (data: Partial<IUser>) => {
    const hashedPassword = await bcrypt.hash(data.senha_hash!, 10);
    const user = new User({ ...data, senha_hash: hashedPassword });
    return await user.save();
};

export const getUsers = async () => {
    return await User.find();
};

export const getUserById = async (id: string) => {
    return await User.findById(id);
};

export const updateUser = async (id: string, data: Partial<IUser>) => {
    if (data.senha_hash) {
        data.senha_hash = await bcrypt.hash(data.senha_hash, 10);
    }
    return await User.findByIdAndUpdate(id, data, { new: true });
};

export const deleteUser = async (id: string) => {
    return await User.findByIdAndDelete(id);
};
