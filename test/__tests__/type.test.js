import request from 'supertest';
import httpStatus from 'http-status';
import app from '../setup/app';
import axios from 'axios';
import TypeBuilder from './builders/typeBuilder';

describe('Types Test', () => {
  it('should get 4 types', async () => {
    const expectedTypeData = [
      {
        name: 'Story',
        slug: 'story',
        icon: 'https://010001.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10315?size=medium',
      },
      {
        name: 'Task',
        slug: 'task',
        icon: 'https://010001.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10318?size=medium',
      },
      {
        name: 'Bug',
        slug: 'bug',
        icon: 'https://010001.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10303?size=medium',
      },
      {
        name: 'Tech Debt',
        slug: 'techDebt',
        icon: 'https://010001.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10308?size=medium',
      },
    ];
    // Create default types
    const expectedTypes = await Promise.all(
      expectedTypeData.map((typeData) => {
        return new TypeBuilder()
          .withName(typeData.name)
          .withSlug(typeData.slug)
          .withIcon(typeData.icon)
          .save();
      })
    );

    const res = await request(app.application)
      .get('/api/v2/types')
      .expect(httpStatus.OK);
    
      expect(res.body).toHaveLength(4);

      const actualTypeNames = res.body.map((type) => type.name);
      const actualTypeSlugs = res.body.map((type) => type.slug);
      const actualTypeIcons = res.body.map((type) => type.icon);

      expectedTypes.forEach(async (type) => {
        expect(actualTypeNames).toContain(type.name);
        expect(actualTypeSlugs).toContain(type.slug);
        expect(actualTypeIcons).toContain(type.icon);

        const response = await axios.get(type.icon);
        expect(response.status).toBe(httpStatus.OK);
      });
  });
});
