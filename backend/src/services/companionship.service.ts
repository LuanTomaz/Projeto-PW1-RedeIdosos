import { Companionship, ICompanionship } from "../models/Companionship";
import { Volunteer } from "../models/Volunteer";

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

// Endpoints de Status
export const acceptCompanionship = async (companionshipId: string, voluntarioId: string) => {
    // Verificar se o voluntário existe e está verificado
    const volunteer = await Volunteer.findById(voluntarioId);
    if (!volunteer) {
        throw new Error("Voluntário não encontrado");
    }
    if (!volunteer.verificado) {
        throw new Error("Voluntário não foi verificado e não pode aceitar solicitações");
    }

    // Atualizar companionship com status 'aceita' e atribuir voluntário
    return await Companionship.findByIdAndUpdate(
        companionshipId,
        { voluntario_id: voluntarioId, status: "aceita" },
        { new: true }
    ).populate("idoso_id").populate("voluntario_id");
};

export const completeCompanionship = async (companionshipId: string, foto_comprovante_url?: string) => {
    // Marcar como concluída
    return await Companionship.findByIdAndUpdate(
        companionshipId,
        { status: "concluida", foto_comprovante_url },
        { new: true }
    ).populate("idoso_id").populate("voluntario_id");
};

export const updateCompanionshipStatus = async (companionshipId: string, novoStatus: string) => {
    // Validar se o status é válido
    const statusValidos = ["pendente", "aceita", "em_andamento", "concluida", "cancelada"];
    if (!statusValidos.includes(novoStatus)) {
        throw new Error(`Status inválido. Valores aceitos: ${statusValidos.join(", ")}`);
    }

    return await Companionship.findByIdAndUpdate(
        companionshipId,
        { status: novoStatus },
        { new: true }
    ).populate("idoso_id").populate("voluntario_id");
};

export const getCompanionshipsByUser = async (userId: string, userType: "idoso" | "voluntario") => {
    if (userType === "idoso") {
        return await Companionship.find({ idoso_id: userId }).populate("idoso_id").populate("voluntario_id");
    } else if (userType === "voluntario") {
        return await Companionship.find({ voluntario_id: userId }).populate("idoso_id").populate("voluntario_id");
    }
    throw new Error("Tipo de usuário inválido");
};
