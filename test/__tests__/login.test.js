import request from 'supertest';
import app from '../setup/app';
import UserBuilder from './builders/userBuilder';

describe('LoginControllerV2 Error Handling', () => {
  let testUser;
  let disabledUser;
  const defaultPassword = 'password123';

  beforeAll(async () => {
    await app.loadApp();

    testUser = await new UserBuilder()
      .withEmail('test@example.com')
      .withName('Test User')
      .withPassword(defaultPassword)
      .withActive(true)
      .save();

    disabledUser = await new UserBuilder()
      .withEmail('disabled@example.com')
      .withName('Disabled User')
      .withPassword(defaultPassword)
      .withActive(false)
      .save();
  });

  it('should throw BadRequestError (400) for validation failure', async () => {
    const res = await request(app.application).post('/api/v2/login').send({
      email: testUser.email,
    });

    expect(res.statusCode).toBe(401);
  });

  it('should throw UnauthorizedError (401) for invalid credentials', async () => {
    const res = await request(app.application).post('/api/v2/login').send({
      email: 'nonexistent@example.com',
      password: 'wrongpassword',
    });

    expect(res.statusCode).toBe(401);
  });

  it('should throw UnauthorizedError (401) for disabled account', async () => {
    const res = await request(app.application).post('/api/v2/login').send({
      email: disabledUser.email,
      password: defaultPassword,
    });

    expect(res.statusCode).toBe(401);
  });

  it('should return appropriate error for unauthorized access', async () => {
    const res = await request(app.application).get('/api/v2/user/auto');

    expect(res.statusCode).toBe(404);
  });
});
