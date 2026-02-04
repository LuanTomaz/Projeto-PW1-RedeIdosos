import { getNeo4jDriver } from '../../config/neo4j';

export const createCompanionshipRelations = async (
  elderId: string,
  volunteerId: string,
  companionshipId: string
) => {
  const session = getNeo4jDriver().session();

  try {
    await session.executeWrite(async (tx) => {
      await tx.run(
        `
        MERGE (e:Elder { id: $elderId })
        MERGE (v:Volunteer { id: $volunteerId })
        MERGE (c:Companionship { id: $companionshipId })

        MERGE (e)-[:REQUESTED]->(c)
        MERGE (v)-[:PARTICIPATES_IN]->(c)
        MERGE (v)-[:HELPED]->(e)
        `,
        { elderId, volunteerId, companionshipId }
      );
    });
  } finally {
    await session.close();
  }
};

// Quando a companhia ainda nao tem voluntario atribuido
export const createElderRequestCompanionship = async (
  elderId: string,
  companionshipId: string
) => {
  const session = getNeo4jDriver().session();

  try {
    await session.executeWrite(async (tx) => {
      await tx.run(
        `
        MERGE (e:Elder { id: $elderId })
        MERGE (c:Companionship { id: $companionshipId })
        MERGE (e)-[:REQUESTED]->(c)
        `,
        { elderId, companionshipId }
      );
    });
  } finally {
    await session.close();
  }
};
