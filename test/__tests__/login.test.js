import request from 'supertest';
import app from '../setup/app';
import db from '../setup/db';
import UserBuilder from './builders/userBuilder';
import TenantBuilder from './builders/tenantBuilder';

describe('Login API tests', () => {
  let tenant;

  beforeAll(async () => {
    tenant = await new TenantBuilder()
      .withOrigin('http://test.com')
      .withPlan('Free')
      .withOwner(db.defaultUser.id)
      .withActive(true)
      .save();
  });

  it('should login with matched data provided', async () => {
    const user = await new UserBuilder()
      .withName('Test User')
      .withEmail('test@gmail.com')
      .withPassword('test123')
      .withTenants([tenant.id])
      .save();

    const res = await request(app.application)
      .post('/api/v2/login')
      .set('Origin', tenant.origin)
      .send({ email: user.email, password: 'test123' });
    expect(res.statusCode).toBe(200);
  });

  it('should login with capitalized email', async () => {
    await new UserBuilder()
      .withEmail('test@gmail.com')
      .withPassword('test123')
      .withTenants([tenant.id])
      .save();

    const res = await request(app.application)
      .post('/api/v2/login')
      .set('Origin', tenant.origin)
      .send({ email: 'TeST@GmAiL.COM', password: 'test123' });
    expect(res.statusCode).toBe(200);
  });
});