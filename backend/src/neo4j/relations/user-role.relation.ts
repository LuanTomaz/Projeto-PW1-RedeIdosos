import { getNeo4jDriver } from '../../config/neo4j';

// Relaciona um User (Mongo user._id) com o perfil (Mongo elder/volunteer/ong _id)
// Ex.: (User {id:userId})-[:IS]->(Elder {id:elderId})
export const relateUserToRole = async (
  userId: string,
  roleLabel: 'Elder' | 'Volunteer' | 'Ong',
  roleId: string
) => {
  const session = getNeo4jDriver().session();

  try {
    await session.executeWrite(async (tx) => {
      await tx.run(
        `
        MERGE (u:User { id: $userId })
        MERGE (r:${roleLabel} { id: $roleId })
        MERGE (u)-[:IS]->(r)
        `,
        { userId, roleId }
      );
    });
  } finally {
    await session.close();
  }
};
