import sinon from 'sinon';
import db from './db';
import app from './app';
import * as authMiddleware from '../../src/app/middleware/authMiddleware';
import * as saasMiddleware from '../../src/app/middleware/saasMiddlewareV2';
import * as permissionMiddleware from '../../src/app/middleware/permissionMiddleware';

beforeAll(async () => {
  require('dotenv').config();
  await db.connect();
  await db.createDefaultData();

  sinon.stub(saasMiddleware, 'saas').callsFake(function (req, res, next) {
    req.dbConnection = db.dbConnection;
    req.tenantsConnection = db.tenantsConnection;
    req.tenantId = db.defaultTenant._id;
    req.userId = db.defaultUser._id;
    return next();
  });

  sinon.stub(authMiddleware, 'authenticationTokenMiddleware').callsFake(function (req, res, next) {
    return next();
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  sinon.stub(permissionMiddleware, 'permission').callsFake(function (slug) {
    return (req, res, next) => {
      return next();
    };
  });
  await app.loadApp();
});

beforeEach(async () => {
  await db.clearDatabase();
  await db.createDefaultData();
});

afterAll(async () => {
  sinon.restore();
  if (db.dbConnection && typeof db.dbConnection.close === 'function') {
    await db.dbConnection.close();
  }
  if (db.tenantConnection && typeof db.tenantConnection.close === 'function') {
    await db.tenantConnection.close();
  }
});
