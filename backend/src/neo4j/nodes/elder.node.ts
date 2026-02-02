import { getNeo4jDriver } from '../../config/neo4j';

export const createElderNode = async (elderId: string) => {
  const session = getNeo4jDriver().session();

  try {
    await session.run(
      'MERGE (e:Elder { id: $id })',
      { id: elderId }
    );
  } finally {
    await session.close();
  }
};
