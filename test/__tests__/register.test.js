import request from 'supertest';
import { invalidForm, validForm } from '../fixtures/register';
import dbHandler from '../dbHandler';


let application = null;
// let dbConnection = '';

beforeAll(async () => {
//   let result = await dbHandler.connect();
//   dbConnection = result.mainConnection;
//   tenantConnection = result.tenantConnection;

  async function loadApp() {
    const appModule = await import('../../src/loaders/express');
    const app = appModule.default;
    application = app();
  }
  await loadApp();
});

afterAll(async () => {
  await dbHandler.closeDatabase();
});


describe('REgister', () => {
  it('should success if user has correct data', async () => {
    const res = await request(application).post('/api/v2/register').send(validForm);
    expect(res.statusCode).toEqual(200);
  });
  //   it('should return 400 if already have company', async () => {
  //     const res = await request(application).post('/api/v2/register').send(validForm);
  //     expect(res.statusCode).toEqual(202);
  //   });
  //   it('should return 400 have invalid company name', async () => {
  //     const res = await request(application).post('/api/v2/register').send(validForm);
  //     expect(res.statusCode).toEqual(202);
  //   });

//   it('should return 500 for any other errors', async () => {
//     const res = await request(application).post('/api/v2/register').send(validForm);
//     expect(res.statusCode).toEqual(202);
//   });
});
