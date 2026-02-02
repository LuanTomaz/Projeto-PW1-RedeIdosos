import neo4j, { Driver } from 'neo4j-driver';

let driver: Driver;

export const connectNeo4j = async (): Promise<Driver> => {
  driver = neo4j.driver(
    process.env.NEO4J_URI as string,
    neo4j.auth.basic(
      process.env.NEO4J_USER as string,
      process.env.NEO4J_PASSWORD as string
    )
  );

  await driver.verifyConnectivity();
  console.log('✅ Neo4j conectado');

  return driver;
};

export const getNeo4jDriver = (): Driver => {
  if (!driver) {
    throw new Error('Neo4j driver nao inicializado');
  }
  return driver;
};
