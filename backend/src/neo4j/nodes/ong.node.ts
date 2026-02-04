import { getNeo4jDriver } from '../../config/neo4j';

export const createOngNode = async (ongId: string) => {
  const session = getNeo4jDriver().session();

  try {
    await session.executeWrite(async (tx) => {
      await tx.run('MERGE (o:Ong { id: $id })', { id: ongId });
    });
  } finally {
    await session.close();
  }
};
