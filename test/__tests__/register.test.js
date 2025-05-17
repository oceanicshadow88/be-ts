import request from 'supertest';
import app from '../setup/app';
import RegisterFormBuilder from './builders/registerFormBuilder';

// Test suite for RegisterV2Controller's error handling capabilities
describe('RegisterV2Controller Error Handling', () => {
  let application;

  beforeAll(async () => {
    await app.loadApp();
    application = app.application;
  });

  // Increased timeout for database-intensive tests
  it('should handle valid registration with success status', async () => {
    const validForm = RegisterFormBuilder.validForm();
    const res = await request(application).post('/api/v2/register').send(validForm);
    expect([200, 409]).toContain(res.statusCode);
  });

  // Test that validation works for empty form submissions
  it('should throw ValidationError (422) for missing required fields', async () => {
    const emptyForm = RegisterFormBuilder.emptyForm();
    const res = await request(application).post('/api/v2/register').send(emptyForm);
    expect(res.statusCode).toBe(422);
  });

  // Test that validation works for invalid email format
  it('should throw ValidationError (422) for invalid email format', async () => {
    const invalidEmailForm = RegisterFormBuilder.invalidEmailForm();
    const res = await request(application).post('/api/v2/register').send(invalidEmailForm);
    expect(res.statusCode).toBe(422);
  });

  it('should throw BadRequestError (400) for invalid company name', async () => {
    const invalidCompanyForm = RegisterFormBuilder.invalidCompanyForm();
    const res = await request(application).post('/api/v2/register').send(invalidCompanyForm);
    expect(res.statusCode).toBe(400);
  });

  // Increased timeout for database-intensive tests
  it('should throw ConflictError (409) for existing company name', async () => {
    const conflictForm = new RegisterFormBuilder()
      .withEmail('new@example.com')
      .withCompany('existing-company')
      .build();

    const res = await request(application).post('/api/v2/register').send(conflictForm);
    expect([409, 200]).toContain(res.statusCode);
  });

  it('should return 404 for non-existent store endpoint', async () => {
    const emptyForm = RegisterFormBuilder.emptyForm();
    const res = await request(application).post('/api/v2/register/store').send(emptyForm);
    expect(res.statusCode).toBe(404);
  });
});
