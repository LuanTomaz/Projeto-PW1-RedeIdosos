import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { json } from 'body-parser';
import authRoutes from './routes/auth.routes';

/*import userRoutes from './routes/user.routes';
import companionshipRoutes from './routes/companionship.routes';*/

dotenv.config();

const app = express();

app.use(cors());
app.use(json());

app.use('/api/auth', authRoutes);

/*app.use('/api/users', userRoutes);
app.use('/api/companionships', companionshipRoutes);*/

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ error: err.message });
});

export default app;
