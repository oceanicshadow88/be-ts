import request from 'supertest';
import app from '../setup/app';
import db from '../setup/db';

describe('Password tests', () => {
  it('should return 200 and send reset email for valid email', async () => {
    const res = await request(app.application)
      .post('/api/v2/reset-password')
      .send({ email: db.defaultUser.email });
    expect(res.statusCode).toBe(200);
  });

  it('should return 200 for uppercased email', async () => {
    const res = await request(app.application)
      .post('/api/v2/reset-password')
      .send({ email: db.defaultUser.email.toUpperCase() });
    expect(res.statusCode).toBe(200);
  });
});