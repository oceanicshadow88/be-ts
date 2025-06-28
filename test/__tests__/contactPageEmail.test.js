import request from 'supertest';
import * as saasMiddleware from '../../src/app/middleware/saasMiddlewareV2';
import { invalidForm, validForm } from '../fixtures/contact';
import sinon from 'sinon';
import dbHandler from '../dbHandler';


let application = null;
let dbConnection = '';
let tenantConnection = '';

beforeAll(async () => {
  let result = await dbHandler.connect();
  dbConnection = result.mainConnection;
  tenantConnection = result.tenantConnection;
  
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
describe.skip('Post /emailus', () => {
  it('should return a 400 status code for invalid req.body', async () => {
    const res = await request(application).post('/api/v2/emailus').send(invalidForm);
    expect(res.statusCode).toEqual(400);
  });
  it('should return a 202 status code for valid req.body', async () => {
    const res = await request(application).post('/api/v2/emailus').send(validForm);
    expect(res.statusCode).toEqual(202);
  });
});
