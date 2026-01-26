import mongoose from 'mongoose';
import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rede-idosos';

const startServer = async () => {
    try {
        // Conectar ao MongoDB
        await mongoose.connect(MONGO_URI);
        console.log('✅ Conectado ao MongoDB');

        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando na porta ${PORT}`);
            console.log(`📡 API disponível em http://localhost:${PORT}`);
        });
    } catch (err: any) {
        console.error('❌ Erro ao iniciar servidor:', err.message);
        process.exit(1);
    }
};

startServer();
