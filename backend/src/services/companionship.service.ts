import { Companionship, ICompanionship } from "../models/Companionship";
import { Volunteer } from "../models/Volunteer";
import { Elder } from "../models/Elder";

const applyPopulate = (query: any) =>
    query
        .populate({ path: "idoso_id", populate: { path: "usuario_id" } })
        .populate({ path: "voluntario_id", populate: { path: "usuario_id" } });

const getStartDateTime = (dateValue: Date, timeValue: string) => {
    const [hoursRaw, minutesRaw] = timeValue.split(":");
    const hours = Number(hoursRaw);
    const minutes = Number(minutesRaw ?? "0");
    const date = new Date(dateValue);
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
        return date;
    }
    date.setHours(hours, minutes, 0, 0);
    return date;
};

const autoUpdateToInProgress = async () => {
    const now = new Date();
    const candidates = await Companionship.find({ status: "aceita" });
    const updates = candidates.map(async (item) => {
        const start = getStartDateTime(item.data, item.hora);
        if (now >= start) {
            item.status = "em_andamento";
            if (!item.inicio_companhia) {
                item.inicio_companhia = now;
            }
            await item.save();
        }
    });
    await Promise.all(updates);
};

export const createCompanionship = async (data: Partial<ICompanionship>) => {
    const companionship = new Companionship(data);
    return await companionship.save();
};

export const getCompanionships = async (options?: { lat?: number; lng?: number; maxDistanceKm?: number }) => {
    await autoUpdateToInProgress();
    if (options?.lat !== undefined && options?.lng !== undefined) {
        const maxDistanceKm = options.maxDistanceKm ?? 10;
        return await applyPopulate(
            Companionship.find({
                localizacao: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [options.lng, options.lat],
                        },
                        $maxDistance: maxDistanceKm * 1000,
                    },
                },
            })
        );
    }

    return await applyPopulate(Companionship.find());
};

export const getCompanionshipById = async (id: string) => {
    await autoUpdateToInProgress();
    return await applyPopulate(Companionship.findById(id));
};

export const updateCompanionship = async (id: string, data: Partial<ICompanionship>) => {
    return await applyPopulate(Companionship.findByIdAndUpdate(id, data, { new: true }));
};

export const deleteCompanionship = async (id: string) => {
    return await Companionship.findByIdAndDelete(id);
};

// Endpoints de Status
export const acceptCompanionship = async (companionshipId: string, voluntarioId: string) => {
    // Verificar se o voluntÃ¡rio existe e estÃ¡ verificado
    const volunteer = await Volunteer.findOne({ usuario_id: voluntarioId });
    if (!volunteer) {
        throw new Error("VoluntÃ¡rio nÃ£o encontrado");
    }
    if (!volunteer.verificado) {
        throw new Error("VoluntÃ¡rio nÃ£o foi verificado e nÃ£o pode aceitar solicitaÃ§Ãµes");
    }

    // Atualizar companionship com status 'aceita' e atribuir voluntÃ¡rio
    const companionship = await Companionship.findById(companionshipId);
    if (!companionship) {
        return null;
    }

    if (companionship.voluntario_id) {
        throw new Error("Companhia ja possui voluntario");
    }

    if (companionship.status !== "pendente") {
        throw new Error("Companhia nao esta pendente");
    }

    return await applyPopulate(Companionship.findByIdAndUpdate(
        companionshipId,
        { voluntario_id: volunteer._id, status: "aceita" },
        { new: true }
    ));
};

export const completeCompanionship = async (companionshipId: string, foto_comprovante_url?: string) => {
    // Marcar como concluÃ­da
    return await applyPopulate(Companionship.findByIdAndUpdate(
        companionshipId,
        { status: "concluida", foto_comprovante_url, fim_companhia: new Date() },
        { new: true }
    ));
};

export const updateCompanionshipStatus = async (companionshipId: string, novoStatus: string) => {
    // Validar se o status Ã© vÃ¡lido
    const statusValidos = ["pendente", "aceita", "em_andamento", "concluida", "cancelada"];
    if (!statusValidos.includes(novoStatus)) {
        throw new Error(`Status invÃ¡lido. Valores aceitos: ${statusValidos.join(", ")}`);
    }

    const updatePayload: Partial<ICompanionship> = { status: novoStatus as any };
    if (novoStatus === "em_andamento") {
        updatePayload.inicio_companhia = new Date();
    }
    if (novoStatus === "concluida") {
        updatePayload.fim_companhia = new Date();
    }

    return await applyPopulate(Companionship.findByIdAndUpdate(
        companionshipId,
        updatePayload,
        { new: true }
    ));
};

export const getCompanionshipsByUser = async (userId: string, userType: "idoso" | "voluntario") => {
    await autoUpdateToInProgress();
    if (userType === "idoso") {
        const elder = await Elder.findOne({ usuario_id: userId });
        if (!elder) return [];
        return await applyPopulate(Companionship.find({ idoso_id: elder._id }));
    } else if (userType === "voluntario") {
        const volunteer = await Volunteer.findOne({ usuario_id: userId });
        if (!volunteer) return [];
        return await applyPopulate(Companionship.find({ voluntario_id: volunteer._id }));
    }
    throw new Error("Tipo de usuÃ¡rio invÃ¡lido");
};

export const assignVolunteerToCompanionship = async (companionshipId: string, volunteerId: string) => {
    const volunteer =
        (await Volunteer.findById(volunteerId)) ??
        (await Volunteer.findOne({ usuario_id: volunteerId }));
    if (!volunteer) {
        throw new Error("Voluntario nao encontrado");
    }
    if (!volunteer.verificado) {
        throw new Error("Voluntario nao verificado");
    }

    const companionship = await Companionship.findById(companionshipId);
    if (!companionship) {
        return null;
    }
    if (companionship.voluntario_id) {
        throw new Error("Companhia ja possui voluntario");
    }
    if (companionship.status !== "pendente") {
        throw new Error("Companhia nao esta pendente");
    }

    return await applyPopulate(Companionship.findByIdAndUpdate(
        companionshipId,
        { voluntario_id: volunteer._id, status: "aceita" },
        { new: true }
    ));
};
