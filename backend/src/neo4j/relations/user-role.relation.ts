import { getNeo4jDriver } from '../../config/neo4j';

export const relateUserToRole = async (
  userId: string,
  role: 'Elder' | 'Volunteer' | 'Ong'
) => {
  const session = getNeo4jDriver().session();

  try {
    await session.run(
      `
      MATCH (u:User { id: $userId })
      MATCH (r:${role} { id: $userId })
      MERGE (u)-[:IS]->(r)
      `,
      { userId }
    );
  } finally {
    await session.close();
  }
};
