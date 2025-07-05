import UserBuilder from '../__tests__/builders/userBuilder';
import TenantBuilder from '../__tests__/builders/tenantBuilder';
import dbHandler from './dbHandler';

let dbConnection = null;
let tenantsConnection = null;
let isInitialized = false;
let defaultUser = null;
let defaultTenant = null;

async function connect() {
  if (!isInitialized) {
    try {
      const result = await dbHandler.connect();
      dbConnection = result.mainConnection;
      tenantsConnection = result.tenantConnection;
      isInitialized = true;
    } catch (error) {
      /* eslint-disable no-console */
      console.error('Failed to initialize database connections:', error);
      throw error;
    }
  }
  return { dbConnection, tenantsConnection };
}

async function createDefaultData() {
  const user = await new UserBuilder().save();
  defaultUser = user;

  const tenant = await new TenantBuilder().withOwner(user._id).save();
  defaultTenant = tenant;
}

async function clearDatabase() {
  return dbHandler.clearDatabase();
}
export default {
  connect,
  clearDatabase,
  createDefaultData,
  get dbConnection() {
    return dbConnection;
  },
  get tenantsConnection() {
    return tenantsConnection;
  },
  get defaultUser() {
    return defaultUser;
  },
  get defaultTenant() {
    return defaultTenant;
  },
};
