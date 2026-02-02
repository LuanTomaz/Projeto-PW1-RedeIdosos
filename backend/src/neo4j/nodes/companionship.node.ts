import { getNeo4jDriver } from '../../config/neo4j';

export const createCompanionshipNode = async (
  id: string,
  status: string,
  data: Date
) => {
  const session = getNeo4jDriver().session();

  try {
    await session.run(
      `
      MERGE (c:Companionship { id: $id })
      SET c.status = $status,
          c.data = $data
      `,
      { id, status, data }
    );
  } finally {
    await session.close();
  }
};
