import request from 'supertest';
import app from '../setup/app';
import db from '../setup/db';
import config from '../../src/app/config/app';

describe('Register API tests', () => {
  it('should register a company if valid data provided', async () => {
    const company = 'testcompany';
  
    const res = await request(app.application)
      .post('/api/v2/register')
      .send({
        company: company,
        email: db.defaultUser.email,
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.newTenants.origin).toBe(`${config.protocol}${company}.${config.mainDomain}`);
    expect(res.body.data.newTenants.owner).toBe(db.defaultUser.id);
    expect(res.body.data.newUser.email).toBe(db.defaultUser.email);
    expect(res.body.data.newUser.id).toBe(db.defaultUser.id);
  });

  it('should register a company for uppercased email', async () => {
    const company = 'testcompany';
  
    const res = await request(app.application)
      .post('/api/v2/register')
      .send({
        company: company,
        email: db.defaultUser.email.toUpperCase(),
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.newTenants.origin).toBe(`${config.protocol}${company}.${config.mainDomain}`);
    expect(res.body.data.newTenants.owner).toBe(db.defaultUser.id);
    expect(res.body.data.newUser.email).toBe(db.defaultUser.email.toLowerCase());
    expect(res.body.data.newUser.id).toBe(db.defaultUser.id);
  });
});
