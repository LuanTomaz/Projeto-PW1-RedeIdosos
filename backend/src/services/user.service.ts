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

// Endpoints de Validação/Verificação
export const validateUser = async (userId: string) => {
    return await User.findByIdAndUpdate(
        userId,
        { verificado: true },
        { new: true }
    );
};

export const changeUserRole = async (userId: string, novoPapel: string) => {
    const papelValidos = ['admin', 'gestor_publico', 'ong', 'voluntario', 'idoso'];
    if (!papelValidos.includes(novoPapel)) {
        throw new Error(`Papel inválido. Valores aceitos: ${papelValidos.join(", ")}`);
    }
    return await User.findByIdAndUpdate(
        userId,
        { papel: novoPapel },
        { new: true }
    );
};

export const changeUserStatus = async (userId: string, novoStatus: boolean) => {
    return await User.findByIdAndUpdate(
        userId,
        { ativo: novoStatus },
        { new: true }
    );
};

export const blockUser = async (userId: string) => {
    return await User.findByIdAndUpdate(
        userId,
        { ativo: false },
        { new: true }
    );
};

export const getUsersByRole = async (papel: string) => {
    const papelValidos = ['admin', 'gestor_publico', 'ong', 'voluntario', 'idoso'];
    if (!papelValidos.includes(papel)) {
        throw new Error(`Papel inválido. Valores aceitos: ${papelValidos.join(", ")}`);
    }
    return await User.find({ papel });
};
