import request from 'supertest';
import httpStatus from 'http-status';
import { ObjectId } from 'mongodb';
import app from '../setup/app';
import db from '../setup/db';
import TicketBuilder from './builders/ticketBuilder';
import ProjectBuilder from './builders/projectBuilder';
import EpicBuilder from './builders/epicBuilder';
import TypeBuilder from './builders/typeBuilder';
import LabelBuilder from './builders/labelBuilder';
import SprintBuilder from './builders/sprintBuilder';
import StatusBuilder from './builders/statusBuilder';
import * as Ticket from '../../src/app/model/ticket';

describe('Get Ticket Test', () => {
  it('should show one ticket by given a valid id', async () => {
    const ticket = await new TicketBuilder().save();

    const res = await request(app.application)
      .get(`/api/v2/tickets/${ticket.id}`)
      .expect(httpStatus.OK);

    expect(res.body.id).toEqual(ticket.id);
  });

  it('should get a ticket by epic id', async () => {
    const epic = await new EpicBuilder().save();
    const ticket = await new TicketBuilder().withEpic(epic.id).save();
    const res = await request(app.application)
      .get(`/api/v2/tickets/epic/${ticket.epic.toString()}`)
      .expect(httpStatus.OK);
      
    expect(res.body[0].id).toEqual(ticket.id);
  });

});

describe('Post Ticket Test', () => {
  it('should create a new ticket if valid info provided', async () => {
    const newTicket = await new TicketBuilder().buildDefault();

    const res = await request(app.application)
      .post('/api/v2/tickets')
      .send(newTicket)
      .expect(httpStatus.CREATED);

    expect(res.body).toHaveProperty('id');

    const ticketInDb = await Ticket.getModel(db.dbConnection).findById(res.body.id);
    expect(ticketInDb).not.toBeNull();
  });

  it.each`
    field          | value
    ${'title'}     | ${undefined}
    ${'projectId'} | ${undefined}
  `('should return UNPROCESSABLE_ENTITY(422) if $field is $value', async ({ field, value }) => {
    const project = await new ProjectBuilder().save();
    const correctTicket = {
      title: 'create ticket test',
      projectId: project.id,
    };

    const wrongTicket = {
      ...correctTicket,
      [field]: value,
    };

    await request(app.application)
      .post('/api/v2/tickets')
      .send(wrongTicket)
      .expect(httpStatus.UNPROCESSABLE_ENTITY);
  });
});

describe('Update Ticket Test', () => {
  it('should update ticket', async () => {
    const ticket = await new TicketBuilder().save();
    const updatedField = {
      title: 'updated ticket',
      description: 'updated ticket',
    };

    const res = await request(app.application)
      .put(`/api/v2/tickets/${ticket.id}`)
      .send(updatedField)
      .expect(httpStatus.OK);

    expect(res.body).toHaveProperty('id', ticket.id);
    expect(res.body).toHaveProperty('title', updatedField.title);
    expect(res.body).toHaveProperty('description', updatedField.description);
  });

  it('could set allowed ticket fields to null', async () => {
    const testId = new ObjectId().toString();
    const epic = await new EpicBuilder().save();
    const label = await new LabelBuilder().save();
    const assignId = db.defaultUser._id;
    const sprint = await new SprintBuilder().save();
    const status = await new StatusBuilder().save();
    
    const ticket = await new TicketBuilder()
      .withLabels([label.id])
      .withComments([testId])
      .withStatus(status.id)
      .withEpic(epic.id)
      .withSprint(sprint.id)
      .withDescription('default description')
      .withDueAt(new Date())
      .withReporter(testId)
      .withAssign(assignId)
      .save();

    const res = await request(app.application)
      .put(`/api/v2/tickets/${ticket.id}`)
      .send({ 
        labels: [],
        comments: [],
        status: null,
        epic: null,
        sprint: null,
        description: null,
        dueAt: null,
        reporter: null,
        assign: null,
       })
      .expect(httpStatus.OK);

    expect(res.body).toHaveProperty('id', ticket.id);
    expect(res.body).toHaveProperty('labels', []);
    expect(res.body).toHaveProperty('comments', []);
    expect(res.body).toHaveProperty('status', null);
    expect(res.body).toHaveProperty('epic', null);
    expect(res.body).toHaveProperty('sprint', null);
    expect(res.body).toHaveProperty('description', null);
    expect(res.body).toHaveProperty('dueAt', null);
    expect(res.body).toHaveProperty('reporter', null);
    expect(res.body).toHaveProperty('assign', null);
  });

  it('should return NOT_FOUND(404) not found', async () => {
    const wrongId = new ObjectId().toString();
    const newTicket = { title: 'updated ticket' };
    await request(app.application)
      .put(`/api/v2/ticket/${wrongId}`)
      .send({ ...newTicket })
      .expect(httpStatus.NOT_FOUND);
  });
});

describe('Delete ticket test', () => {
  it('should delete ticket by given id', async () => {
    const ticket = await new TicketBuilder().save();
    await request(app.application)
      .delete(`/api/v2/tickets/${ticket.id}`)
      .expect(httpStatus.NO_CONTENT);

    const checkDeleteTicket = await Ticket.getModel(db.dbConnection).findById(ticket.id);
    expect(checkDeleteTicket).toBeFalsy();
  });

  it('should return NOT_FOUND(404) not found', async () => {
    const wrongId = new ObjectId().toString();
    await request(app.application)
      .delete(`/api/v2/tickets/${wrongId}`)
      .expect(httpStatus.NOT_FOUND);
  });
});
