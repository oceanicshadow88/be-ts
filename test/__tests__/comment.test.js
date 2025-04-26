import request from 'supertest';
import sinon from 'sinon';
import dbHandler from '../dbHandler';
import * as saasMiddleware from '../../src/app/middleware/saasMiddlewareV2';
import * as User from '../../src/app/model/user';
import * as Project from '../../src/app/model/project';
import * as Ticket from '../../src/app/model/ticket';
import * as Comment from '../../src/app/model/comment';
import bcrypt from 'bcrypt';

let application = null;
let dbConnection = '';
let tenantConnection = '';

beforeAll(async () => {
  let result = await dbHandler.connect();
  dbConnection = result.mainConnection;
  tenantConnection = result.tenantConnection;
  await dbHandler.clearDatabase();

  await User.getModel(tenantConnection).create({
    email: 'test@gamil.com',
    password: await bcrypt.hash('testPassword', 8),
    active: true,
  });
  await Project.getModel(dbConnection).create({
    _id: '62f33512e420a96f31ddc2bd',
    name: 'test name',
    key: 'key123',
    projectLead: 'projectLead1',
    owner: '62e8d28a182f4561a92f6aed',
  });
  await Ticket.getModel(dbConnection).create({
    _id: '62e4bc9692266e6c8fcd0bbe',
    title: 'test ticket',
  });
  await Comment.getModel(dbConnection).create({
    _id: '62f3664589e47f4d0b7e5327',
    ticketId: '62e4bc9692266e6c8fcd0bbe',
    sender: '62e8d28a182f4561a92f6aed',
    content: 'test update comment',
  });

  sinon.stub(saasMiddleware, 'saas').callsFake(function (req, res, next) {
    req.dbConnection = dbConnection;
    req.tenantsConnection = tenantConnection;
    return next();
  });

  async function loadApp() {
    const appModule = await import('../../src/loaders/express');
    const app = appModule.default;
    application = app();
  }
  await loadApp();
});

afterAll(async () => {
  saasMiddleware.saas.restore();
  await dbHandler.closeDatabase();
});

describe('Create Comment Test', () => {
  it('should create comment', async () => {
    const newComment = {
      ticketId: '62e4bc9692266e6c8fcd0bbe',
      sender: '62e8d28a182f4561a92f6aed',
      content: 'new comment',
    };
    const res = await request(application)
      .post('/api/v2/comments')
      .send({ ...newComment });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toMatchObject({ ...newComment });
  });
  it('should return error code 422', async () => {
    const newComment = { ticketId: undefined, sender: undefined, content: 'New Comment' };
    const res = await request(application)
      .post('/api/v2/comments')
      .send({ ...newComment });
    expect(res.statusCode).toEqual(422);
  });
});

describe('Get Comment Test', () => {
  it('should get comment', async () => {
    const id = '62f3664589e47f4d0b7e5327';
    const res = await request(application).get(`/api/v2/comments/${id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body[0].id).toEqual(id);
  });
});

describe('Update Comment Test', () => {
  it('should update comment test', async () => {
    const id = '62f3664589e47f4d0b7e5327';
    const newComment = { content: 'Updated Comment' };
    const res = await request(application)
      .put(`/api/v2/comments/${id}`)
      .send({ ...newComment });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toMatchObject({ ...newComment });
  });
  it('should return error code 404', async () => {
    const id = undefined;
    const newComment = { content: undefined };
    const res = await request(application)
      .post(`/api/v2/comments/${id}`)
      .send({ ...newComment });
    expect(res.statusCode).toEqual(404);
  });
  it('should return error code 422', async () => {
    const id = '62f3664589e47f4d0b7e5327';
    const newComment = undefined;
    const res = await request(application)
      .post(`/api/v2/comments/${id}`)
      .send({ ...newComment });
    expect(res.statusCode).toEqual(404);
  });
});
describe('Delete Comment Test', () => {
  it('should delete comment', async () => {
    const id = '62f3664589e47f4d0b7e5327';
    const res = await request(application).delete(`/api/v2/comments/${id}`);
    expect(res.statusCode).toEqual(204);
  });
  it('should return 404', async () => {
    const id = '62f3664589e47f4d0b7e5328';
    const res = await request(application).delete(`/api/v2/comments/${id}`);
    expect(res.statusCode).toEqual(404);
  });
});
