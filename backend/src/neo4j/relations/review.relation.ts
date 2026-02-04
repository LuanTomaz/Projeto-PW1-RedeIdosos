import { getNeo4jDriver } from '../../config/neo4j';

// Cria/atualiza a relacao (User)-[:REVIEWED]->(User)
// Observacao: se houver multiplos reviews entre o mesmo par, esta relacao sera unica (MERGE).
export const createReviewRelation = async (
  authorId: string,
  targetId: string,
  props: { nota?: number; tipo?: string; data?: Date } = {}
) => {
  const session = getNeo4jDriver().session();

  try {
    await session.executeWrite(async (tx) => {
      await tx.run(
        `
        MERGE (a:User { id: $authorId })
        MERGE (t:User { id: $targetId })
        MERGE (a)-[r:REVIEWED]->(t)
        SET r.nota = coalesce($nota, r.nota),
            r.tipo = coalesce($tipo, r.tipo),
            r.data = coalesce($data, r.data)
        `,
        {
          authorId,
          targetId,
          nota: props.nota ?? null,
          tipo: props.tipo ?? null,
          data: props.data ? props.data.toISOString() : null,
        }
      );
    });
  } finally {
    await session.close();
  }
};
