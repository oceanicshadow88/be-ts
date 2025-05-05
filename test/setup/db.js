import UserBuilder from '../__tests__/builders/userBuilder';
import TypeBuilder from '../__tests__/builders/typeBuilder';
import StatusBuilder from '../__tests__/builders/statusBuilder';
import LabelBuilder from '../__tests__/builders/labelBuilder';
import EpicBuilder from '../__tests__/builders/epicBuilder';
import SprintBuilder from '../__tests__/builders/sprintBuilder';
import dbHandler from './dbHandler';

let dbConnection = null;
let tenantsConnection = null;
let isInitialized = false;
let tenantId = '62e333606fb0da0a12dcfe78';
let defaultUser = null;
let defaultTicketType = null;
let defaultStatus = null;

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
  const types = await TypeBuilder.createDefaultTypes();
  const statuses = await StatusBuilder.createDefaultStatuses();
  const label = await new LabelBuilder().save();
  const epic = await new EpicBuilder().save();
  const sprint = await new SprintBuilder().save();

  defaultTicketType = types[0];
  defaultStatus = statuses[0];
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
  get defaultTicketType() {
    return defaultTicketType;
  },
  get defaultStatus() {
    return defaultStatus;
  },
  tenantId,
};
