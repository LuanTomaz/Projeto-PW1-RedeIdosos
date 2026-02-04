import { Request, Response } from "express";
import * as UserService from "../services/user.service";
import { z } from "zod";
import { User } from "../models/User";

// Usando validação com Zod
const createUserSchema = z.object({
  nome: z.string().min(3),
  email: z.string().email(),
  senha: z.string().min(6),
  tipo_cadastro: z.enum(["idoso", "voluntario", "ong"]),
});

// Controlador para criação de usuário
export const createUser = async (req: Request, res: Response) => {
  try {
    const validated = createUserSchema.parse(req.body);

    const user = await UserService.createUser(validated);

    res.status(201).json({
      message: "Usuário criado com sucesso. Complete seu cadastro.",
      user,
    });

  } catch (err: any) {
    res.status(400).json({
      error: err.errors ?? err.message,
    });
  }
};

// Controlador para listar usuários
export const getUsers = async (req: Request, res: Response) => {
  try {
    const { papel } = req.query;

    let users;
    if (papel) {
      users = await UserService.getUsersByRole(papel as string);
    } else {
      users = await UserService.getUsers();
    }
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Endpoints de Validação/Verificação
export const validateUserController = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const user = await UserService.validateUser(id);

    res.json({
      message: "Usuário validado com sucesso",
      user,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// Rota para alterar papel do usuário, atualmente não usada
// export const changeUserRole = async (req: Request, res: Response) => {
//     try {
//         const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
//         const { papel } = req.body;

//         if (!papel) {
//             return res.status(400).json({ error: "papel é obrigatório" });
//         }

//         const user = await UserService.changeUserRole(id, papel);
//         res.json({ message: "Papel do usuário alterado com sucesso", user });
//     } catch (err: any) {
//         res.status(400).json({ error: err.message });
//     }
// };

// Endpoint para bloquear usuário
export const blockUser = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const user = await UserService.blockUser(id);
    res.json({ message: "Usuário bloqueado com sucesso", user });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// Endpoint para promover usuário a admin
export const promoteToAdmin = async (req: Request, res: Response) => {
  try {
    const targetUserId = req.params.id;
    const requesterId = (req as any).user.id;

    // Impede auto-promoção
    if (targetUserId === requesterId) {
      return res.status(400).json({
        error: "Você não pode promover a si mesmo"
      });
    }

    const user = await User.findById(targetUserId);

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    if (!user.ativo) {
      return res.status(400).json({ error: "Usuário está inativo" });
    }

    if (!user.verificado) {
      return res.status(400).json({ error: "Usuário não verificado" });
    }

    if (user.papel === "admin") {
      return res.status(400).json({ error: "Usuário já é admin" });
    }

    user.papel = "admin";
    await user.save();

    res.json({
      message: "Usuário promovido a administrador com sucesso",
      user
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Endpoints de Filtros por Papel
export const getVolunteers = async (req: Request, res: Response) => {
  try {
    const volunteers = await UserService.getUsersByRole('voluntario');
    res.json(volunteers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getElders = async (req: Request, res: Response) => {
  try {
    const elders = await UserService.getUsersByRole('idoso');
    res.json(elders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getOngs = async (req: Request, res: Response) => {
  try {
    const ongs = await UserService.getUsersByRole('ong');
    res.json(ongs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getAdmins = async (req: Request, res: Response) => {
  try {
    const admins = await UserService.getUsersByRole('admin');
    res.json(admins);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getGestoresPublicos = async (req: Request, res: Response) => {
  try {
    const gestores = await UserService.getUsersByRole('gestor_publico');
    res.json(gestores);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getUnverifiedVolunteers = async (req: Request, res: Response) => {
  try {
    const volunteers = await UserService.getUsersByRole('voluntario');
    const unverified = volunteers.filter((v: any) => !v.verificado);
    res.json(unverified);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};


