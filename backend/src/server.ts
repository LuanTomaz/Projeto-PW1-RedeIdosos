import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '.env') });

import app from './app';
import { connectDatabase } from './config/mongodb';
import { connectNeo4j } from './config/neo4j';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDatabase();
    await connectNeo4j();
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
  } catch (err: any) {
    console.error('❌ Erro ao iniciar servidor:', err.message);
    process.exit(1);
  }
};

startServer();
