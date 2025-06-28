import request from 'supertest';
import app from '../setup/app';
import db from '../setup/db';
import UserBuilder from './builders/userBuilder';

describe('Register API tests', () => {
  it('should register a company if correct data provided', async () => {
    const res = await request(application).post('/api/v2/register').send(validForm);
    expect(res.statusCode).toEqual(200);
  });
});
