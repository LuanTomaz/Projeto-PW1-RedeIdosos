import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface JwtPayload {
    id: string;
    papel: string;
    tipo_cadastro: string;
}

export interface AuthRequest extends Request {
    user?: JwtPayload;
}

// Middleware para verificar token JWT
export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization não fornecido' });
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
        return res.status(401).json({ message: 'Token mal formatado' });
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as JwtPayload;

        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ message: 'Token inválido ou expirado' });
    }
};

// Middleware para verificar papel/permissão do usuário
export const authorizeRole = (allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Usuário não autenticado' });
        }

        const userRole = req.user.papel;

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                message: 'Acesso negado. Papel insuficiente.',
                requiredRoles: allowedRoles,
                userRole: userRole
            });
        }

        next();
    };
};

// Middleware para verificar múltiplas permissões
export const authorize = (...allowedRoles: string[]) => {
    return authorizeRole(allowedRoles);
};
