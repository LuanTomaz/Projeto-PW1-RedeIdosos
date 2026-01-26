import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: any;
}

// Middleware para verificar token JWT
export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token não fornecido' });

    jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Token inválido' });
        req.user = decoded;
        next();
    });
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
