import request from 'supertest';
import { setup, restore } from '../helpers';
import { BOARD_SEED } from '../fixtures/board';
import { STATUS_TEST } from '../fixtures/statuses';

let application = null;

beforeAll(async () => {
  const { app } = await setup();
  application = app();
});

afterAll(async () => {
  await restore();
});

describe.skip('Test statuses', () => {
  it('should get all statuses', async () => {
    const res = await request(application).get(`/api/v2/boards/${BOARD_SEED._id}/statuses`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(STATUS_TEST);
  });

  it('should response with 404 if no board provided', async () => {
    const res = await request(application).get('/api/v2/boards//statuses');
    expect(res.statusCode).toEqual(404);
  });
});
