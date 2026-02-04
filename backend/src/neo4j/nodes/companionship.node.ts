import { getNeo4jDriver } from '../../config/neo4j';

export const createCompanionshipNode = async (
  id: string,
  status: string,
  data: Date
) => {
  const session = getNeo4jDriver().session();

  try {
    const result = await session.executeWrite(async (tx) =>
      tx.run(
        `
        MERGE (c:Companionship { id: $id })
        SET c.status = $status,
            c.data = datetime($data)
        `,
        { id, status, data: data.toISOString() }
      )
    );

    console.log('Neo4j updates:', result.summary.counters.updates());
  } finally {
    await session.close();
  }
};

export const updateCompanionshipStatusNode = async (id: string, status: string) => {
  const session = getNeo4jDriver().session();

  try {
    await session.executeWrite(async (tx) => {
      await tx.run(
        `
        MATCH (c:Companionship { id: $id })
        SET c.status = $status
        `,
        { id, status }
      );
    });
  } finally {
    await session.close();
  }
};
