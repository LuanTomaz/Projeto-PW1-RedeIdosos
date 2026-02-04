import { getNeo4jDriver } from '../../config/neo4j';

export const deleteNodeById = async (label: string, id: string) => {
  const session = getNeo4jDriver().session();

  try {
    await session.executeWrite(async (tx) => {
      await tx.run(
        `
        MATCH (n:${label} { id: $id })
        DETACH DELETE n
        `,
        { id }
      );
    });
  } finally {
    await session.close();
  }
};
