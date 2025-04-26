import request from 'supertest';
import sinon from 'sinon';
import dbHandler from '../dbHandler';
import * as saasMiddleware from '../../src/app/middleware/saasMiddlewareV2';
import * as authMiddleware from '../../src/app/middleware/authMiddleware';
import * as User from '../../src/app/model/user';
import * as Project from '../../src/app/model/project';
import * as Ticket from '../../src/app/model/ticket';
import * as Board from '../../src/app/model/board';
import * as Status from '../../src/app/model/status';
import * as Type from '../../src/app/model/type';
import * as fixture from '../fixtures/ticket';
import bcrypt from 'bcrypt';
import { replaceId } from '../../src/app/services/replaceService';

let application = null;
let dbConnection = '';
let tenantConnection = '';
let token = '';

const projectId = '6350d443bddbe8fed0138ffe';
const userId = '632fc37a89d19ed1f57c7ab1';
const statusId = '6350d443bddbe8fed0138ff4';
const ticketId = '6350e579d6a0ceeb4fc89fd9';
const typeId = '63fe01c8f5b40ad08cfac583';
const boardId = '6350d443bddbe8fed0138ffd';
beforeAll(async () => {
  let result = await dbHandler.connect();
  dbConnection = result.mainConnection;
  tenantConnection = result.tenantConnection;
  await dbHandler.clearDatabase();

  await User.getModel(tenantConnection).create({
    _id: userId,
    name: 'Joe',
    email: 'test@gmail.com',
    password: await bcrypt.hash('testPassword', 8),
    active: true,
    avatarIcon: 'https://example.png',
  });
  await Project.getModel(dbConnection).create({
    _id: projectId,
    name: 'test name',
    key: 'key123',
    projectLead: 'projectLead1',
    owner: userId,
  });

  await Type.getModel(dbConnection).create({
    _id: typeId,
    slug: 'story',
    name: 'Story',
    icon: 'https://010001.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10315?size=medium',
    createdAt: '2022-09-11T07:57:04.258Z',
    updatedAt: '2022-09-11T07:57:04.258Z',
  });

  await Ticket.getModel(dbConnection).create({
    _id: ticketId,
    title: 'test ticket',
    description: '',
    projectId: projectId,
    reporter: userId,
    type: typeId,
    status: statusId,
    dueAt: '2022-10-20T06:06:45.946Z',
    createdAt: '2022-10-20T06:06:49.590Z',
  });

  await Status.getModel(dbConnection).create([
    {
      _id: statusId,
      name: 'to do',
      slug: 'to-do',
      order: 0,
      board: '6350d443bddbe8fed0138ffd',
    },
    {
      _id: '6350d443bddbe8fed0138ff5',
      name: 'in progress',
      slug: 'in-progress',
      order: 1,
      board: '6350d443bddbe8fed0138ffd',
    },
    {
      _id: '6350d443bddbe8fed0138ff6',
      name: 'review',
      slug: 'review',
      order: 2,
      board: '6350d443bddbe8fed0138ffd',
    },
    {
      _id: '6350d443bddbe8fed0138ff7',
      name: 'done',
      slug: 'done',
      order: 3,
      board: '6350d443bddbe8fed0138ffd',
    },
  ]);

  await Board.getModel(dbConnection).create({
    _id: boardId,
    title: 'Project X',
    statuses: [
      '6350d443bddbe8fed0138ff4',
      '6350d443bddbe8fed0138ff5',
      '6350d443bddbe8fed0138ff6',
      '6350d443bddbe8fed0138ff7',
    ],
  });

  sinon.stub(authMiddleware, 'authenticationTokenMiddleware').callsFake(function (req, res, next) {
    return next();
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
  authMiddleware.authenticationTokenMiddleware.restore();
  saasMiddleware.saas.restore();
  await dbHandler.closeDatabase();
});

describe('Get One Ticket Test', () => {
  it('should show one ticket', async () => {
    const res = await request(application).get(`/api/v2/tickets/${ticketId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(replaceId(fixture.getTickets()));
  });
});

describe('Post Ticket Test', () => {
  it('should create a new ticket if valid info provided', async () => {
    const newTicket = {
      title: 'create ticket test',
      type: typeId,
      status: 'to do',
      projectId: projectId,
    };
    const res = await request(application)
      .post('/api/v2/tickets')
      .send(newTicket)
      .set('Authorization', token);

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      id: expect.any(String),
      assign: null,
      attachmentUrls: [],
      comments: [],
      dueAt: expect.any(Object),
      priority: 'Medium',
      projectId: '6350d443bddbe8fed0138ffe',
      sprintId: null,
      isActive: true,
      status: {
        id: '6350d443bddbe8fed0138ff4',
        name: 'to do',
        order: 0,
        slug: 'to-do',
      },
      type: {
        __v: 0,
        createdAt: expect.any(String),
        id: '63fe01c8f5b40ad08cfac583',
        name: 'Story',
        slug: 'story',
        icon: 'https://010001.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10315?size=medium',
        updatedAt: expect.any(String),
      },
      storyPoint: 0,
      tags: [],
      title: 'create ticket test',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  it.each`
    field          | value
    ${'title'}     | ${''}
    ${'projectId'} | ${undefined}
    ${'typeId'}    | ${undefined}
  `('should return 422 if $field is $value', async ({ field, value }) => {
    const correctTicket = {
      title: 'create ticket test',
      projectId: projectId,
    };

    const wrongTicket = {
      ...correctTicket,
      [field]: value,
    };

    const res = await request(application)
      .post('/api/v2/tickets')
      .send(wrongTicket)
      .set('Authorization', token);

    expect(res.statusCode).toEqual(422);
  });

  it('should return 422 if no title was given', async () => {
    const newTicket = {
      status: 'to do',
      projectId: projectId,
    };
    const res = await request(application)
      .post('/api/v2/tickets')
      .send(newTicket)
      .set('Authorization', token);
    expect(res.statusCode).toEqual(422);
  });
});

describe('Update Ticket Test', () => {
  it('should update ticket', async () => {
    const updatedField = {
      description: 'updated ticket',
      priority: 'Lowest',
      type: '63fe01c8f5b40ad08cfac583',
    };
    const res = await request(application).put(`/api/v2/tickets/${ticketId}`).send(updatedField);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      id: ticketId,
      assign: null,
      attachmentUrls: [],
      title: 'test ticket',
      description: 'updated ticket',
      projectId: projectId,
      priority: 'Lowest',
      comments: [],
      reporter: {
        avatarIcon: 'https://example.png',
        email: 'test@gmail.com',
        id: '632fc37a89d19ed1f57c7ab1',
        name: 'Joe',
      },
      sprintId: null,
      isActive: true,
      storyPoint: 0,
      tags: [],
      status: {
        id: '6350d443bddbe8fed0138ff4',
        name: 'to do',
        order: 0,
        slug: 'to-do',
      },
      type: {
        id: '63fe01c8f5b40ad08cfac583',
        slug: 'story',
        name: 'Story',
        createdAt: '2022-09-11T07:57:04.258Z',
        updatedAt: '2022-09-11T07:57:04.258Z',
        icon: 'https://010001.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10315?size=medium',
        __v: 0,
      },
      dueAt: '2022-10-20T06:06:45.946Z',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  it('should return 404 not found', async () => {
    const wrongId = '62e4bc9692266e6c8fcd0bb1';
    const newTicket = { title: 'updated ticket' };
    const res = await request(application)
      .put(`/api/v2/ticket/${wrongId}`)
      .send({ ...newTicket });
    expect(res.statusCode).toEqual(404);
  });

  it('should return 422 if title is an empty string', async () => {
    const newTicket = { title: '', description: 'hello' };
    const res = await request(application)
      .put(`/api/v2/ticket/${ticketId}`)
      .send({ ...newTicket });
    expect(res.statusCode).toEqual(422);
  });
});

describe('Delete ticket test', () => {
  it('should delete ticket', async () => {
    const res = await request(application).delete(`/api/v2/tickets/${ticketId}`);
    expect(res.statusCode).toEqual(204);
    const checkDeleteTicket = await Ticket.getModel(dbConnection).findById(ticketId);
    expect(checkDeleteTicket).toBeFalsy();
  });
  it('should return 404 not found', async () => {
    const wrongId = '62e4bc9692266e6c8fcddddd';
    const res = await request(application).delete(`/api/v2/tickets/${wrongId}`);
    expect(res.statusCode).toEqual(404);
  });
});
