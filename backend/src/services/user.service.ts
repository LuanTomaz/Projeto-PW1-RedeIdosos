import { User, IUser } from "../models/User";
import { Volunteer } from "../models/Volunteer";
import bcrypt from "bcryptjs";

export const createUser = async (data: Partial<IUser>) => {
    const hashedPassword = await bcrypt.hash(data.senha!, 10);
    const user = new User({
        ...data,
        senha: hashedPassword,
        papel: "pending",
        verificado: false,
        ativo: false
    });
    return await user.save();
};

export const getUsers = async () => {
    return await User.find();
};

export const getUserById = async (id: string) => {
    return await User.findById(id);
};

export const updateUser = async (id: string, data: Partial<IUser>) => {
    if (data.senha) {
        data.senha = await bcrypt.hash(data.senha, 10);
    }
    return await User.findByIdAndUpdate(id, data, { new: true });
};

export const deleteUser = async (id: string) => {
    return await User.findByIdAndDelete(id);
};

// Endpoints de Validação/Verificação
export const validateUser = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  if (!user.ativo) {
    throw new Error("Usuário ainda não completou o perfil");
  }

  let novoPapel: "idoso" | "voluntario" | "ong";

  switch (user.tipo_cadastro) {
    case "idoso":
      novoPapel = "idoso";
      break;
    case "voluntario":
      novoPapel = "voluntario";
      break;
    case "ong":
      novoPapel = "ong";
      break;
    default:
      throw new Error("Tipo de cadastro inválido");
  }

  user.papel = novoPapel;
  user.verificado = true;

  await user.save();

  if (novoPapel === "voluntario") {
    await Volunteer.findOneAndUpdate(
      { usuario_id: user._id },
      { verificado: true }
    );
  }

  return user;
};


export const changeUserRole = async (userId: string, novoPapel: string) => {
    const papelValidos = ['admin', 'ong', 'voluntario', 'idoso'];
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
        { verificado: false },
        { new: true }
    );
};

export const getUsersByRole = async (papel: string) => {
    const papelValidos = ['admin', 'ong', 'voluntario', 'idoso'];
    if (!papelValidos.includes(papel)) {
        throw new Error(`Papel inválido. Valores aceitos: ${papelValidos.join(", ")}`);
    }
    return await User.find({ papel });
};
