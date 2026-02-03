import { Request, Response, NextFunction } from "express";

export const requireActiveUser = (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ error: "Não autenticado" });
  }

  if (!req.user.verificado) {
    return res.status(403).json({
      error: "Conta ainda não foi ativada pelo administrador"
    });
  }

  next();
};
