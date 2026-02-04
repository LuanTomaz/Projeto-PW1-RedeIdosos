import { getNeo4jDriver } from '../../config/neo4j';

export const createCompanionshipNode = async (
  id: string,
  status: string,
  data: Date
) => {
  const session = getNeo4jDriver().session();

  try {
    const result = await session.run(
      `
      MERGE (c:Companionship { id: $id })
      SET c.status = $status,
          c.data = $data
      `,
      { id, status, data }
    );

    console.log("Neo4j result:", result.summary.counters.updates());
  } finally {
    await session.close();
  }
};
