import request from 'supertest';
import EpicBuilder from './builders/epicBuilder';
import TicketBuilder from './builders/ticketBuilder';
import app from '../setup/app';

describe('Epic Test', () => {
  it('get epic by project, should get epics', async () => {
    const epic = await new EpicBuilder().save();
    const res = await request(app.application)
      .get(`/api/v2/epics/project/${epic.project.toString()}`) 
      .expect(200);
    expect(res.body[0].id).toEqual(epic.id);
    expect(res.body[0].title).toEqual(epic.title);
    expect(res.body[0].project).toEqual(epic.project.toString());
  });

  it('get epic by id, should get epics', async () => {
    const epic = await new EpicBuilder().save();
    const res = await request(app.application)
      .get(`/api/v2/epics/${epic.id}`) 
      .expect(200);
    expect(res._body.id).toEqual(epic.id);
    expect(res._body.title).toEqual(epic.title);
    expect(res._body.project).toEqual(epic.project.toString());
  });

  it('create epic, should create epic', async () => {
    const epic = await new EpicBuilder().buildDefault();
    const res = await request(app.application)
      .post('/api/v2/epics') 
      .send({ ...epic }); 
    expect(res.body.title).toEqual(epic.title);
    expect(res.body.project).toEqual(epic.project.toString());
  });

  it('update epic, should update epic', async () => {
    const updatedName = 'hey';
    const epic = await new EpicBuilder().save();
    expect(epic.title).toEqual('Epic Title');
    const res = await request(app.application)
      .put(`/api/v2/epics/${epic.id}`) 
      .send({ title: updatedName }); 
    expect(res.body.id).toEqual(epic.id);
    expect(res.body.title).toEqual(updatedName);
  });

  it('delete epic, should delete epic', async () => {
    const epic = await new EpicBuilder().save();
    const ticket = await new TicketBuilder().withEpic(epic.id).save();
    await request(app.application).delete(`/api/v2/epics/${epic.id}`).expect(200);
  
    const res = await request(app.application).get(`/api/v2/tickets/${ticket.id}`).expect(200);
    expect(res.body).not.toBeNull();
    expect(res.body).toHaveProperty('epic');
    expect(res.body.epic).toBeNull();
  });

  it('create epic, should return 422 when missing title', async () => {
    const epic = await new EpicBuilder().buildDefault();
    await request(app.application)
      .post('/api/v2/epics') 
      .send({ ...epic, ...{ title: null } })
      .expect(422); 
  });

  it('create epic, should return 422 when missing project', async () => {
    const epic = await new EpicBuilder().buildDefault();
    await request(app.application)
      .post('/api/v2/epics') 
      .send({ ...epic, ...{ project: null } })
      .expect(422); 
  });
});