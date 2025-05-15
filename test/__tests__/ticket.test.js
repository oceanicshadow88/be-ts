import request from 'supertest';
import httpStatus from 'http-status';
import { ObjectId } from 'mongodb';
import app from '../setup/app';
import db from '../setup/db';
import TicketBuilder from './builders/ticketBuilder';
import ProjectBuilder from './builders/projectBuilder';
import * as Ticket from '../../src/app/model/ticket';

describe('Get Ticket Test', () => {
  it('should show one ticket by given a valid id', async () => {
    const ticket = await new TicketBuilder().save();

    const res = await request(app.application)
      .get(`/api/v2/tickets/${ticket._id}`)
      .expect(httpStatus.OK);

    expect(res.body.id).toEqual(ticket._id.toString());
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
      projectId: project._id,
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
      .put(`/api/v2/tickets/${ticket._id}`)
      .send(updatedField)
      .expect(httpStatus.OK);

    expect(res.body).toHaveProperty('id', ticket._id.toString());
    expect(res.body).toHaveProperty('title', updatedField.title);
    expect(res.body).toHaveProperty('description', updatedField.description);
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
      .delete(`/api/v2/tickets/${ticket._id}`)
      .expect(httpStatus.NO_CONTENT);

    const checkDeleteTicket = await Ticket.getModel(db.dbConnection).findById(ticket._id);
    expect(checkDeleteTicket).toBeFalsy();
  });

  it('should return NOT_FOUND(404) not found', async () => {
    const wrongId = new ObjectId().toString();
    await request(app.application)
      .delete(`/api/v2/tickets/${wrongId}`)
      .expect(httpStatus.NOT_FOUND);
  });
});
