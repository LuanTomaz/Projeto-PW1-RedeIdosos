import { Request, Response } from "express";
import * as UserService from "../services/user.service";
import { z } from "zod";
import { User } from "../models/User";
import { Volunteer } from "../models/Volunteer";
import { Elder } from "../models/Elder";
import { Ong } from "../models/Ong";
import { createUserNode } from "../neo4j/nodes/user.node";
import { deleteNodeById } from "../neo4j/utils/delete";

// Usando validaÃ§Ã£o com Zod
const createUserSchema = z.object({
  nome: z.string().min(3),
  email: z.string().email(),
  senha: z.string().min(6),
  tipo_cadastro: z.enum(["idoso", "voluntario", "ong"]),
  telefone: z
    .string()
    .optional()
    .transform((value) => (value && value.trim() !== "" ? value : undefined)),
});

// Controlador para criaÃ§Ã£o de usuÃ¡rio
export const createUser = async (req: Request, res: Response) => {
  try {
    const validated = createUserSchema.parse(req.body);

    const user = await UserService.createUser(validated);

    // Neo4j: garante existencia do node do usuario
    await createUserNode(user._id.toString());

    res.status(201).json({
      message: "UsuÃ¡rio criado com sucesso. Complete seu cadastro.",
      user,
    });

  } catch (err: any) {
    res.status(400).json({
      error: err.errors ?? err.message,
    });
  }
};

// Controlador para listar usuÃ¡rios
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

// Endpoints de ValidaÃ§Ã£o/VerificaÃ§Ã£o
export const validateUserController = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const user = await UserService.validateUser(id);

    res.json({
      message: "UsuÃ¡rio validado com sucesso",
      user,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// Rota para alterar papel do usuÃ¡rio, atualmente nÃ£o usada
// export const changeUserRole = async (req: Request, res: Response) => {
//     try {
//         const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
//         const { papel } = req.body;

//         if (!papel) {
//             return res.status(400).json({ error: "papel Ã© obrigatÃ³rio" });
//         }

//         const user = await UserService.changeUserRole(id, papel);
//         res.json({ message: "Papel do usuÃ¡rio alterado com sucesso", user });
//     } catch (err: any) {
//         res.status(400).json({ error: err.message });
//     }
// };

// Endpoint para bloquear usuÃ¡rio
export const blockUser = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const user = await UserService.blockUser(id);
    res.json({ message: "UsuÃ¡rio bloqueado com sucesso", user });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
// Endpoint para atualizar status ativo/inativo
export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const schema = z.object({ ativo: z.boolean() });
    const { ativo } = schema.parse(req.body ?? {});
    const user = await UserService.changeUserStatus(id, ativo);
    res.json({ message: "Status do usuÃ¡rio atualizado", user });
  } catch (err: any) {
    res.status(400).json({ error: err.errors ?? err.message });
  }
};

// Endpoint para promover usuÃ¡rio a admin
export const promoteToAdmin = async (req: Request, res: Response) => {
  try {
    const targetUserId = req.params.id;
    const requesterId = (req as any).user.id;

    // Impede auto-promoÃ§Ã£o
    if (targetUserId === requesterId) {
      return res.status(400).json({
        error: "VocÃª nÃ£o pode promover a si mesmo"
      });
    }

    const user = await User.findById(targetUserId);

    if (!user) {
      return res.status(404).json({ error: "UsuÃ¡rio nÃ£o encontrado" });
    }

    if (!user.ativo) {
      return res.status(400).json({ error: "UsuÃ¡rio estÃ¡ inativo" });
    }

    if (!user.verificado) {
      return res.status(400).json({ error: "UsuÃ¡rio nÃ£o verificado" });
    }

    if (user.papel === "admin") {
      return res.status(400).json({ error: "UsuÃ¡rio jÃ¡ Ã© admin" });
    }

    user.papel = "admin";
    await user.save();

    res.json({
      message: "UsuÃ¡rio promovido a administrador com sucesso",
      user
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
// Endpoint para atualizar dados bÃ¡sicos do usuÃ¡rio
export const updateUserController = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const schema = z.object({
      nome: z.string().min(3).optional(),
      email: z.string().email().optional(),
      senha: z.string().min(6).optional(),
      telefone: z
        .string()
        .optional()
        .transform((value) => (value && value.trim() !== "" ? value : undefined)),
    });
    const payload = schema.parse(req.body ?? {});
    const user = await UserService.updateUser(id, payload);
    res.json({ message: "Status do usuÃ¡rio atualizado", user });
  } catch (err: any) {
    res.status(400).json({ error: err.errors ?? err.message });
  }
};

// Endpoint para remover usuÃ¡rio
export const deleteUserController = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const requesterId = (req as any).user?.id;

    if (requesterId && requesterId === id) {
      return res.status(400).json({ error: "VocÃª nÃ£o pode remover a si mesmo" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "UsuÃ¡rio nÃ£o encontrado" });
    }

    const elder = await Elder.findOneAndDelete({ usuario_id: user._id });
    const volunteer = await Volunteer.findOneAndDelete({ usuario_id: user._id });
    const ong = await Ong.findOneAndDelete({ usuario_id: user._id });

    await UserService.deleteUser(id);

    try {
      if (elder?._id) await deleteNodeById("Elder", elder._id.toString());
      if (volunteer?._id) await deleteNodeById("Volunteer", volunteer._id.toString());
      if (ong?._id) await deleteNodeById("Ong", ong._id.toString());
      await deleteNodeById("User", id);
    } catch (e) {
      console.error("Neo4j delete user node error:", e);
    }

    res.json({ message: "UsuÃ¡rio removido com sucesso" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
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

export const getUnverifiedVolunteers = async (req: Request, res: Response) => {
  try {
    const volunteers = await UserService.getUsersByRole('voluntario');
    const unverified = volunteers.filter((v: any) => !v.verificado);
    res.json(unverified);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Dev-only: ativa/verifica um usuario para testes
export const devActivateUser = async (req: Request, res: Response) => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ error: "Endpoint disponivel apenas em development" });
    }

    const { id, email, papel } = req.body ?? {};
    if (!id && !email) {
      return res.status(400).json({ error: "Informe id ou email" });
    }

    const query = id ? { _id: id } : { email };
    const updated = await User.findOneAndUpdate(
      query as any,
      {
        $set: {
          ativo: true,
          verificado: true,
          ...(papel ? { papel } : {}),
        },
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Usuario nao encontrado" });
    }

    if ((papel ?? updated.tipo_cadastro) === "voluntario") {
      await Volunteer.findOneAndUpdate(
        { usuario_id: updated._id },
        { verificado: true }
      );
    }

    res.json({ message: "Usuario ativado para testes", user: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};





