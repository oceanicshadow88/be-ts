import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod;
let tenantMongod;
let mainConnection;
let tenantConnection;

/**
 * Connect to the in-memory database.
 */
const connect = async () => {
  //NOTE: order matters in here

  // Start both database services in parallel
  mongod = new MongoMemoryServer();
  tenantMongod = new MongoMemoryServer();

  await mongod.start();
  await tenantMongod.start();

  // Get the URIs
  const uri = mongod.getUri();
  const tenantUri = tenantMongod.getUri();

  // Connect to the tenants database using createConnection
  tenantConnection = await mongoose.createConnection(tenantUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Connect to the main database using the default mongoose connection
  mainConnection = await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  return { mainConnection, tenantConnection };
};

/**
 * Drop database, close the connection and stop mongod.
 */
const closeDatabase = async () => {
  await mongoose.connection.dropDatabase();
  if (tenantConnection) {
    await tenantConnection.dropDatabase();
    await tenantConnection.close();
  }
  await mongoose.connection.close();
  if (mongod) await mongod.stop();
  if (tenantMongod) await tenantMongod.stop();
};

/**
 * Remove all the data for all db collections.
 */
const clearDatabase = async () => {
  const mainCollections = await mongoose.connection.db.collections();
  for (const collection of mainCollections) {
    await collection.deleteMany({});
  }

  // Clear the tenant database
  if (tenantConnection) {
    const tenantCollections = await tenantConnection.db.collections();
    for (const collection of tenantCollections) {
      await collection.deleteMany({});
    }
  }
};

export default { connect, closeDatabase, clearDatabase };
