import request from 'supertest';
import app from '../setup/app';
import TicketBuilder from './builders/ticketBuilder';
import ProjectBuilder from './builders/projectBuilder';
import TypeBuilder from './builders/typeBuilder';
import UserBuilder from './builders/userBuilder';
import EpicBuilder from './builders/epicBuilder';
import LabelBuilder from './builders/labelBuilder';

describe('Backlog Page API Tests', () => {

  describe('Get backlog tickets tests', () => {
    it('should return 200 and a list of backlog tickets', async () => {
      const ticket = await new TicketBuilder().save();

      const res = await request(app.application)
        .get(`/api/v2/projects/${ticket.project}/backlogs`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);

      const returnedTicket = res.body.find((t) => t.id === ticket.id);
      expect(returnedTicket).toBeDefined();
      expect(returnedTicket.title).toEqual(ticket.title);
    });

    it('should return 200 and empty array if no backlog tickets', async () => {
      const project = await new ProjectBuilder().save();

      const res = await request(app.application)
        .get(`/api/v2/projects/${project._id.toString()}/backlogs`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
  });

  describe('Get backlog tickets with filters', () => {
    it('should return 200 and matching tickets when searched by title', async () => {
      const ticket = await new TicketBuilder()
        .withTitle('Unique Search Keyword')
        .save();

      const res = await request(app.application)
        .get(`/api/v2/projects/${ticket.project}/backlogs`)
        .query({ title: 'Unique' })
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      const returnedTicket = res.body.find((t) => t.id === ticket.id);
      expect(returnedTicket).toBeDefined();
      expect(returnedTicket.title).toContain('Unique');
    });

    it('should return 200 and empty array if no tickets match search', async () => {
      const project = await new ProjectBuilder().save();
      const res = await request(app.application)
        .get(`/api/v2/projects/${project._id.toString()}/backlogs`)
        .query({ title: 'NonexistentTitle' })
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    it('should return 200 and matching tickets when searched by assignee', async () => {
      const user = await new UserBuilder().save();
      const ticket = await new TicketBuilder()
        .withAssign(user)
        .save();
      const res = await request(app.application)
        .get(`/api/v2/projects/${ticket.project}/backlogs`)
        .query({ assign: user._id.toString() })
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toEqual(1);
      const returnedTicket = res.body.find((t) => t.id === ticket.id);
      expect(returnedTicket).toBeDefined();
      expect(returnedTicket.assign).toEqual(user._id.toString());
    });

    it('should return 200 and empty array if no tickets match assignee', async () => {
      const project = await new ProjectBuilder().save();
      const user = await new UserBuilder().save();
      const res = await request(app.application)
        .get(`/api/v2/projects/${project._id.toString()}/backlogs`)
        .query({ assign: user._id.toString() })
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    it('should return 200 and matching tickets when searched by type', async () => {
      const types = await TypeBuilder.createDefaultTypes();
      const ticket = await new TicketBuilder()
        .withType(types[0])
        .save();

      const res = await request(app.application)
        .get(`/api/v2/projects/${ticket.project}/backlogs`)
        .query({ ticketTypes: types[0]._id.toString() })
        .expect(200);
        
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toEqual(1);
      const returnedTicket = res.body.find((t) => t.id === ticket.id);
      expect(returnedTicket).toBeDefined();
      expect(returnedTicket.type).toEqual(types[0]._id.toString());
    });

    it('should return 200 and empty array if no tickets match type', async () => {
      const project = await new ProjectBuilder().save();
      const types = await TypeBuilder.createDefaultTypes();
      const res = await request(app.application)
        .get(`/api/v2/projects/${project._id.toString()}/backlogs`)
        .query({ ticketTypes: types[0]._id.toString() })
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    it('should return 200 and matching tickets when searched by epic', async () => {
      const project = await new ProjectBuilder().save();
      const epic = await new EpicBuilder()
        .withProject(project)
        .save();

      const ticket = await new TicketBuilder()
        .withEpic(epic._id.toString())
        .withProject(project)
        .save();

      const res = await request(app.application)
        .get(`/api/v2/projects/${project._id.toString()}/backlogs`)
        .query({ ticketEpics: epic._id.toString() })
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toEqual(1);
      const returnedTicket = res.body.find((t) => t.id === ticket.id);
      expect(returnedTicket).toBeDefined();
      expect(returnedTicket.epic).toEqual(epic._id.toString());
    });

    it('should return 200 and empty array if no tickets match epic', async () => {
      const project = await new ProjectBuilder().save();
      const epic = await new EpicBuilder()
        .withProject(project)
        .save();

      const res = await request(app.application)
        .get(`/api/v2/projects/${project._id.toString()}/backlogs`)
        .query({ ticketEpics: epic._id.toString() })
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    // Implement after label filter is added to the API
    // TO-DO: it('should return 200 and matching tickets when searched by labels', async () => {});
    // TO-DO: it('should return 200 and empty array if no tickets match labels', async () => {});
  });
});
