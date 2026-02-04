import { Report, IReport } from "../models/Report";
import { Companionship } from "../models/Companionship";
import { Elder } from "../models/Elder";
import { Volunteer } from "../models/Volunteer";
import { Review } from "../models/Review";
import { User } from "../models/User";

export const createReport = async (data: Partial<IReport>) => {
    const report = new Report(data);
    return await report.save();
};

export const getReports = async () => {
    return await Report.find().populate("usuario_id", "nome email papel");
};

export const getReportById = async (id: string) => {
    return await Report.findById(id).populate("usuario_id", "nome email papel");
};

export const updateReport = async (id: string, data: Partial<IReport>) => {
    return await Report.findByIdAndUpdate(id, data, { new: true });
};

export const deleteReport = async (id: string) => {
    return await Report.findByIdAndDelete(id);
};

// Relatórios Dinâmicos

export const generateSummaryReport = async (dataInicio?: Date, dataFim?: Date) => {
    const filtro: any = {};
    
    if (dataInicio || dataFim) {
        filtro.createdAt = {};
        if (dataInicio) filtro.createdAt.$gte = dataInicio;
        if (dataFim) filtro.createdAt.$lte = dataFim;
    }

    const totalCompanionships = await Companionship.countDocuments(filtro);
    const completedCompanionships = await Companionship.countDocuments({ 
        status: "concluida", 
        ...filtro 
    });
    const totalElders = await Elder.countDocuments(filtro);
    const totalVolunteers = await Volunteer.countDocuments(filtro);
    const totalReviews = await Review.countDocuments(filtro);

    return {
        periodo: { inicio: dataInicio, fim: dataFim },
        totalCompanionships,
        completedCompanionships,
        totalElders,
        totalVolunteers,
        totalReviews,
        taxaConclusao: totalCompanionships > 0 ? ((completedCompanionships / totalCompanionships) * 100).toFixed(2) : 0
    };
};

export const generateStatisticsReport = async () => {
    const companionshipsByStatus = await Companionship.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const reviewsAverage = await Review.aggregate([
        { $group: { _id: null, media: { $avg: "$nota" } } }
    ]);

    const topVolunteers = await Companionship.aggregate([
        { $group: { _id: "$voluntario_id", totalCompanionships: { $sum: 1 } } },
        { $sort: { totalCompanionships: -1 } },
        { $limit: 10 },
        { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "voluntario" } }
    ]);

    return {
        companionshipsByStatus,
        mediaAvaliacao: reviewsAverage[0]?.media || 0,
        voluntariosTopRanking: topVolunteers
    };
};

export const generateImpactReport = async () => {
    const totalCompanionships = await Companionship.countDocuments({ status: "concluida" });
    const totalIdosAdendidos = await Companionship.distinct("idoso_id");
    const totalVoluntariosEngajados = await Companionship.distinct("voluntario_id");
    const mediaAvaliacoes = await Review.aggregate([
        { $group: { _id: null, media: { $avg: "$nota" } } }
    ]);

    return {
        impactoSocial: {
            companionshipsRealizadas: totalCompanionships,
            idosAtendidos: totalIdosAdendidos.length,
            voluntariosEngajados: totalVoluntariosEngajados.length,
            mediaAvaliacao: mediaAvaliacoes[0]?.media || 0,
            impactoEstimado: `${totalCompanionships} atividades de companhia realizadas beneficiando ${totalIdosAdendidos.length} idosos`
        }
    };
};

export const generateLocationsReport = async () => {
    const companionshipsByLocation = await Companionship.aggregate([
        {
            $group: {
                _id: "$local_descricao",
                total: { $sum: 1 },
                latitude: { $first: "$latitude" },
                longitude: { $first: "$longitude" }
            }
        },
        { $sort: { total: -1 } }
    ]);

    return {
        mapa: companionshipsByLocation
    };
};

export const generateEldersReport = async () => {
    const eldersStats = await Elder.aggregate([
        {
            $lookup: {
                from: "companionships",
                localField: "_id",
                foreignField: "idoso_id",
                as: "companionships"
            }
        },
        {
            $project: {
                usuario_id: 1,
                endereco: 1,
                necessidades_especiais: 1,
                totalCompanionships: { $size: "$companionships" }
            }
        },
        { $sort: { totalCompanionships: -1 } }
    ]);

    return {
        elderStats: eldersStats
    };
};

export const getReportsByType = async (tipo: string) => {
    return await Report.find({ tipo }).populate("usuario_id", "nome email");
};

export const getReportsByUser = async (
    usuarioId: string,
    options?: { from?: Date; to?: Date }
) => {
    const filtro: any = { usuario_id: usuarioId };
    if (options?.from || options?.to) {
        filtro.gerado_em = {};
        if (options.from) filtro.gerado_em.$gte = options.from;
        if (options.to) filtro.gerado_em.$lte = options.to;
    }
    return await Report.find(filtro).populate("usuario_id", "nome email");
};
