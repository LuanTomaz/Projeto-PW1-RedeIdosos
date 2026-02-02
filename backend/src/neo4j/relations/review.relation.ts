import { getNeo4jDriver } from '../../config/neo4j';

export const createReviewRelation = async (
  authorId: string,
  targetId: string
) => {
  const session = getNeo4jDriver().session();

  try {
    await session.run(
      `
      MATCH (a:User { id: $authorId })
      MATCH (t:User { id: $targetId })
      MERGE (a)-[:REVIEWED]->(t)
      `,
      { authorId, targetId }
    );
  } finally {
    await session.close();
  }
};
