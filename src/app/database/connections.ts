import { tenantConnection, dataConnectionPool } from '../utils/dbContext';
import mongoose from 'mongoose';
import * as Tenant from '../model/tenants';
import config from '../../app/config/app';
const PUBLIC_DB = 'publicdb';
mongoose.set('strictQuery', false);

const options = {
  useNewURLParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  socketTimeoutMS: 30000,
};

const tenantsDBConnection = async () => {
  if (!tenantConnection?.connection) {
    tenantConnection.connection = await mongoose.createConnection(
      config.tenantsDBConnection,
      options,
    );
  }
  const tenantModel = await Tenant.getModel(tenantConnection?.connection);
  await tenantModel.find({});
  return tenantConnection.connection;
};

const tenantDBConnection = async (tenant: string) => {
  if (!dataConnectionPool || !dataConnectionPool[tenant]!) {
    const dataConnectionMongoose = await mongoose.createConnection(
      config.publicConnection.replace(PUBLIC_DB, tenant),
      options,
    );
    dataConnectionPool[tenant] = dataConnectionMongoose;
    const tenantModel = await Tenant.getModel(dataConnectionMongoose);
    await tenantModel.find({});
    return dataConnectionMongoose;
  }

  return dataConnectionPool[tenant];
};

export { PUBLIC_DB, tenantsDBConnection, tenantDBConnection };
