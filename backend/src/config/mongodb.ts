require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);
import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('❌ MONGODB_URI não definida no .env');
  }

  try {
    await mongoose.connect(uri);
    console.log('✅ Conectado ao MongoDB');
  } catch (error: any) {
    console.error('❌ Erro ao conectar ao MongoDB:', error.message);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  console.log('✅ Desconectado do MongoDB');
};
