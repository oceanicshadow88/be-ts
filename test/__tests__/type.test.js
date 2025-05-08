import request from 'supertest';
import httpStatus from 'http-status';
import app from '../setup/app';
import axios from 'axios';

describe('Types Test', () => {
  it('should get 4 types', async () => {
    const res = await request(app.application)
      .get('/api/v2/types')
      .expect(httpStatus.OK);
    
      expect(res.body).toHaveLength(4);

      const expectedTypeNames = ['Story', 'Bug', 'Task', 'Tech Debt'];
      const expectedTypeSlugs = ['story', 'bug', 'task', 'techDebt'];

      const actualTypeNames = res.body.map((type) => type.name);
      const actualTypeSlugs = res.body.map((type) => type.slug);

      expectedTypeNames.forEach((typeName) => {
        expect(actualTypeNames).toContain(typeName);
      });

      expectedTypeSlugs.forEach((typeSlug) => {
        expect(actualTypeSlugs).toContain(typeSlug);
      });

      for (const type of res.body) {
        expect(type).toHaveProperty('icon');

        const response = await axios.get(type.icon);
        expect(response.status).toBe(httpStatus.OK);
      }
  });
});
