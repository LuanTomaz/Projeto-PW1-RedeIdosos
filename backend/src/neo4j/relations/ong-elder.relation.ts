import { getNeo4jDriver } from '../../config/neo4j';

export const relateOngToElder = async (ongId: string, elderId: string) => {
  const session = getNeo4jDriver().session();

  try {
    await session.run(
      `
      MATCH (o:Ong { id: $ongId })
      MATCH (e:Elder { id: $elderId })
      MERGE (o)-[:ASSISTS]->(e)
      `,
      { ongId, elderId }
    );
  } finally {
    await session.close();
  }
};
