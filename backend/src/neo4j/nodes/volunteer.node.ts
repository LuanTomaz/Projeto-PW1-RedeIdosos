import { getNeo4jDriver } from '../../config/neo4j';

export const createVolunteerNode = async (volunteerId: string) => {
  const session = getNeo4jDriver().session();

  try {
    await session.run(
      'MERGE (v:Volunteer { id: $id })',
      { id: volunteerId }
    );
  } finally {
    await session.close();
  }
};
