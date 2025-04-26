import request from 'supertest';
import dbHandler from '../dbHandler';
import sinon from 'sinon';
import * as saasMiddleware from '../../src/app/middleware/saasMiddlewareV2';

let application = null;
let dbConnection = '';
beforeAll(async () => {
  let result = await dbHandler.connect();
  dbConnection = result.mainConnection;
  
  sinon.stub(saasMiddleware, 'saas').callsFake(function (req, res, next) {
    req.dbConnection = dbConnection;
    return next();
  });
  async function loadApp() {
    const appModule = await import('../../src/loaders/express');
    const app = appModule.default;
    application = app();
  }
  await loadApp();
},
);

afterAll(async () => {
  saasMiddleware.saas.restore();
  await dbHandler.closeDatabase();
});

describe('Types Test', () => {
  it('should get types', async () => {
    const res = await request(application).get('/api/v2/types');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(
      [
        {
          slug: 'story',
          name: 'Story',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          icon: 'https://010001.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10315?size=medium',
          id: expect.any(String),
        },
        {
          slug: 'task',
          name: 'Task',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          icon: 'https://010001.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10318?size=medium',
          id: expect.any(String),
        },
        {
          slug: 'bug',
          name: 'Bug',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          icon: 'https://010001.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10303?size=medium',
          id: expect.any(String),
        },
        {
          slug: 'techDebt',
          name: 'Tech Debt',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          icon: 'https://010001.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10308?size=medium',
          id: expect.any(String),
        },
      ],
    );
  });
});
