import request from 'supertest';
import app from '../setup/app';
import UserBuilder from './builders/userBuilder';
import mongoose from 'mongoose';

describe('UserController Error Handling', () => {
  let authToken;
  let testUser;
  const defaultPassword = 'password123';

  beforeAll(async () => {
    await app.loadApp();

    testUser = await new UserBuilder()
      .withEmail('test@example.com')
      .withName('Test User')
      .withPassword(defaultPassword)
      .save();

    const res = await request(app.application).post('/api/v2/login').send({
      email: testUser.email,
      password: defaultPassword,
    });

    authToken = res.body.token;
  });

  it('should throw ValidationError (422) for invalid ID format', async () => {
    const res = await request(app.application)
      .get('/api/v2/users/invalid-id')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(422);
  });

  it('should handle blank user ID appropriately', async () => {
    const res = await request(app.application)
      .get('/api/v2/users/ ')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
  });

  it('should throw NotFoundError (404) for non-existent user', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();

    const res = await request(app.application)
      .get(`/api/v2/users/${nonExistentId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(404);
  });
});
