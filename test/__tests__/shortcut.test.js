import request from 'supertest';
import dbHandler from '../dbHandler';
import * as User from '../../src/app/model/user';
import mongoose from 'mongoose';
import * as Project from '../../src/app/model/project';
import sinon from 'sinon';
import * as saasMiddleware from '../../src/app/middleware/saasMiddlewareV2';
let application = null;
let dbConnection = '';
let tenantConnection = '';

const userId = new mongoose.Types.ObjectId();
const projectId = new mongoose.Types.ObjectId();
const shortcutId = new mongoose.Types.ObjectId();

const user = {
  _id: userId,
  email: 'test@gamil.com',
  password: 'testtesttest',
  active: true,
};

const project = {
  _id: projectId,
  name: 'test name',
  key: 'key123',
  projectLead: 'projectLead1',
  owner: userId,
  shortcut: [{ _id: shortcutId, name: 'yahoo.co.jp', shortcutLink: 'yahoo' }],
};

beforeAll(async () => {
  let result = await dbHandler.connect();
  dbConnection = result.mainConnection;
  tenantConnection = result.tenantConnection;
  await dbHandler.clearDatabase();
  await User.getModel(dbConnection).create(user);
  await Project.getModel(dbConnection).create(project);

  sinon.stub(saasMiddleware, 'saas').callsFake(function (req, res, next) {
    req.dbConnection = dbConnection;
    req.tenantsConnection = tenantConnection;
    return next();
  });

  async function loadApp() {
    const appModule = await import('../../src/loaders/express');
    const app = appModule.default;
    application = app();
  }
  await loadApp();
});

afterAll(async () => {
  saasMiddleware.saas.restore();
  await dbHandler.closeDatabase();
});

describe.skip('Create Shortcut Test', () => {
  it('should create shortcut', async () => {
    const shortcut = { shortcutLink: 'https://www.google.com', name: 'Google' };
    const res = await request(application)
      .post(`/api/v2/projects/${projectId}/shortcuts`)
      .send({ ...shortcut });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(expect.objectContaining({ ...shortcut }));
  });

  it('should return 403 if provided a link without http://', async () => {
    const shortcut = { shortcutLink: 'go.com', name: 'go' };
    const res = await request(application)
      .post(`/api/v2/projects/${projectId}/shortcuts`)
      .send({ ...shortcut });
    expect(res.statusCode).toEqual(403);
  });

  it('should return 422', async () => {
    const shortcut = { shortcutLink: undefined, name: undefined };
    const res = await request(application)
      .post(`/api/v2/projects/${projectId}/shortcuts`)
      .send({ ...shortcut });
    expect(res.statusCode).toEqual(422);
  });
});
describe.skip('Update Shortcut Test', () => {
  it('should update shortcut', async () => {
    const newShortcut = { shortcutLink: 'https://www.steinsgate.jp/', name: 'Steins Gate' };
    const res = await request(application)
      .put(`/api/v2/projects/${projectId}/shortcuts/${shortcutId}`)
      .send({ ...newShortcut });
    expect(res.statusCode).toEqual(200);
  });
  it('should Return Conflict', async () => {
    const newShortcut = { shortcutLink: 'twitter.com', name: 'Twitter' };
    const wrongShortcutId = '62ee2acf9ec184ff866da4e3';
    const WrongProjectId = '62edd13ce3af744361a45fed';
    const res = await request(application)
      .put(`/api/v2/projects/${WrongProjectId}/shortcuts/${wrongShortcutId}`)
      .send({ ...newShortcut });
    expect(res.statusCode).toEqual(409);
  });
  it('should return 422', async () => {
    const shortcut = { shortcutLink: undefined, name: undefined };
    const wrongShortcutId = '62ee2c4641dbc06481a70e03';
    const res = await request(application)
      .put(`/api/v2/projects/${projectId}/shortcuts/${wrongShortcutId}`)
      .send({ ...shortcut });
    expect(res.statusCode).toEqual(422);
  });
});
describe.skip('Destroy Shortcut Test', () => {
  it('should delete shortcut', async () => {
    const res = await request(application).delete(
      `/api/v2/projects/${projectId}/shortcuts/${shortcutId}`,
    );
    expect(res.statusCode).toEqual(200);
  });
  it('should return NOT_FOUND', async () => {
    const res = await request(application).delete(
      `/api/v2/projects/${projectId}/shortcuts/${shortcutId}`,
    );
    expect(res.statusCode).toEqual(404);
  });
});
