import request from 'supertest';
import app from '../setup/app';
import TicketBuilder from './builders/ticketBuilder';
import ProjectBuilder from './builders/projectBuilder';

describe('Backlog Page API Tests', () => {
  let project;

  beforeAll(async () => {
    project = await new ProjectBuilder().save();
  });
  describe('GET /projects/:projectId/backlogs', () => {
    it('should return 200 and a list of backlog tickets', async () => {
      const ticket = await new TicketBuilder().withProject(project).withSprint(null).save();

      const res = await request(app.application)
        .get(`/api/v2/projects/${project._id.toString()}/backlogs`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);

      const returnedTicket = res.body.find((t) => t.id === ticket.id);
      expect(returnedTicket).toBeDefined();
      expect(returnedTicket.title).toEqual(ticket.title);
    });

    it('should return 200 and empty array if no backlog tickets', async () => {
      const newProject = await new ProjectBuilder().save();

      const res = await request(app.application)
        .get(`/api/v2/projects/${newProject._id.toString()}/backlogs`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
  });

  describe('GET /projects/:projectId/backlogs/search', () => {
    it('should return 200 and matching tickets when searched by title', async () => {
      const ticket = await new TicketBuilder()
        .withProject(project)
        .withSprint(null)
        .withTitle('Unique Search Keyword')
        .save();

      const res = await request(app.application)
        .get(`/api/v2/projects/${project._id.toString()}/backlogs/search`)
        .query({ query: 'Unique' })
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      const returnedTicket = res.body.find((t) => t.id === ticket.id);
      expect(returnedTicket).toBeDefined();
      expect(returnedTicket.title).toContain('Unique');
    });

    it('should return 200 and empty array if no tickets match search', async () => {
      const res = await request(app.application)
        .get(`/api/v2/projects/${project._id.toString()}/backlogs/search`)
        .query({ query: 'NonexistentTitle' })
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
  });
});
