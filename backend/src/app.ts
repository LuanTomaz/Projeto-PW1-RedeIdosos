import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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

dotenv.config();

const app = express();

app.use(cors());
app.use(json());

// Servir arquivos estáticos
app.use('/uploads', express.static('backend/uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/elders', elderRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/companionships', companionshipRoutes);
app.use('/api/ongs', ongRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/reports', reportRoutes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ error: err.message });
});

export default app;
