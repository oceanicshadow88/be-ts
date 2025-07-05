import request from 'supertest';
import app from '../setup/app';
import db from '../setup/db';
import UserBuilder from './builders/userBuilder';

describe('Login API tests', () => {
  it('should login with matched data provided', async () => {
    const user = await new UserBuilder()
      .withName('Test User')
      .withEmail('test@gmail.com')
      .withPassword('test123')
      .withTenants([db.defaultTenant.id])
      .save();

    const res = await request(app.application)
      .post('/api/v2/login')
      .set('Origin', db.defaultTenant.origin)
      .send({ email: user.email, password: 'test123' });
    expect(res.statusCode).toBe(200);
  });

  it('should login with capitalized email', async () => {
    await new UserBuilder()
      .withEmail('test@gmail.com')
      .withPassword('test123')
      .withTenants([db.defaultTenant.id])
      .save();

    const res = await request(app.application)
      .post('/api/v2/login')
      .set('Origin', db.defaultTenant.origin)
      .send({ email: 'TeST@GmAiL.COM', password: 'test123' });
    expect(res.statusCode).toBe(200);
  });
});