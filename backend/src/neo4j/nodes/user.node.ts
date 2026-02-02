import { getNeo4jDriver } from '../../config/neo4j';

export const createUserNode = async (userId: string) => {
  const session = getNeo4jDriver().session();

  try {
    await session.run(
      'MERGE (u:User { id: $id })',
      { id: userId }
    );
  } finally {
    await session.close();
  }
};
