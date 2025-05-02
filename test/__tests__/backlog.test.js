import request from 'supertest';
import httpStatus from 'http-status';
import app from '../setup/app';
import TicketBuilder from './builders/ticketBuilder';
import ProjectBuilder from './builders/projectBuilder';
import TypeBuilder from './builders/typeBuilder';
import EpicBuilder from './builders/epicBuilder';
import UserBuilder from './builders/userBuilder';
import LabelBuilder from './builders/labelBuilder';
import SprintBuilder from './builders/sprintBuilder';
import { before } from 'node:test';

describe('Get Backlog Tickets Test', () => {
    it('should show all tickets', async () => {
        const project = await new ProjectBuilder().save();
        const tickets = [];

        for (let i = 0; i < 5; i++) {
            const ticket = await new TicketBuilder().withProject(project._id).save();
            console.log('Ticket created:', ticket);
            tickets.push(ticket);
        }

        const res = await request(app.application)
            .get(`/api/v2/projects/${project._id}/backlogs`)
            .expect(httpStatus.OK);

        expect(res.body.length).toBe(5);

        const ticketIds = tickets.map(ticket => ticket._id.toString());
        const responseIds = res.body.map(ticket => ticket.id);
        expect(responseIds).toEqual(expect.arrayContaining(ticketIds));
    });
});
    
describe('Get Backlog Tickets Test with Filters', () => {
    let ticket;
    beforeAll(async () => {
        ticket = await new TicketBuilder()
            .withTitle('Test Ticket')
            .withType(await new TypeBuilder().save())
            .withEpic(await new EpicBuilder().save())
            .withProject(await new ProjectBuilder().save())
            .withUsers(await new UserBuilder().save())
            .withLabels(await new LabelBuilder().save())
            .withSprint(await new SprintBuilder().save())
            .save();
    });

    it.each`
        field          | value
        ${'title'}     | ${ticket.title}
        ${'type'}      | ${ticket.type}
        ${'epic'}      | ${ticket.epic}
        ${'users'}     | ${ticket.users[0]}
        ${'labels'}    | ${ticket.labels[0]}
        ${'sprint'}    | ${ticket.sprint}
    `('should filter tickets by $field', async ({ field, value }) => {
        const res = await request(app.application)
            .get(`/api/v2/projects/${ticket.project}/backlogs`)
            .query({ [field]: value })
            .expect(httpStatus.OK);

        expect(res.body.length).toBe(1);
        expect(res.body[0].id).toBe(ticket._id.toString());
    });

});
    // Add more tests here
