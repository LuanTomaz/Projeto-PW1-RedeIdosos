import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { json } from 'body-parser';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import elderRoutes from './routes/elder.routes';
import volunteerRoutes from './routes/volunteer.routes';
import fileRoutes from './routes/file.routes';
import companionshipRoutes from './routes/companionship.routes';
import ongRoutes from './routes/ong.routes';
import reviewRoutes from './routes/review.routes';
import reportRoutes from './routes/report.routes';
import mapRoutes from './routes/map.routes';
import publicRoutes from './routes/public.routes';
import verificationRoutes from './routes/verification.routes';

dotenv.config();

const app = express();

app.use(cors());
app.use(json());

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Rota para autenticação de usuários
app.use('/api/auth', authRoutes);
app.use('/', authRoutes);

// Rota para gerenciamento de usuários
app.use('/api/users', userRoutes);
app.use('/api/elders', elderRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/files', fileRoutes);

// Rota para gerenciamento de companhias
app.use('/api/companionships', companionshipRoutes);
app.use('/api/ongs', ongRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/verifications', verificationRoutes);

// Rotas publicas (sem /api para aderir ao enunciado)
app.use('/', publicRoutes);
app.use('/map', mapRoutes);
app.use('/verifications', verificationRoutes);
app.use('/upload', fileRoutes);
app.use('/files', fileRoutes);
app.use('/users', userRoutes);
app.use('/elders', elderRoutes);
app.use('/volunteers', volunteerRoutes);
app.use('/companionships', companionshipRoutes);
app.use('/ongs', ongRoutes);
app.use('/reviews', reviewRoutes);
app.use('/reports', reportRoutes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ error: err.message });
});

export default app;
