import { getNeo4jDriver } from '../../config/neo4j';

export const createCompanionshipRelations = async (
  elderId: string,
  volunteerId: string,
  companionshipId: string
) => {
  const session = getNeo4jDriver().session();

  try {
    await session.run(
      `
      MATCH (e:Elder { id: $elderId })
      MATCH (v:Volunteer { id: $volunteerId })
      MATCH (c:Companionship { id: $companionshipId })

      MERGE (e)-[:REQUESTED]->(c)
      MERGE (v)-[:PARTICIPATES_IN]->(c)
      MERGE (v)-[:HELPED]->(e)
      `,
      { elderId, volunteerId, companionshipId }
    );
  } finally {
    await session.close();
  }
};
