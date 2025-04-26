import request from 'supertest';
import TicketBuilder from './builders/ticketBuilder';
import app from '../setup/app';
import db from '../setup/db';
import StatusBuilder from './builders/statusBuilder';
import TypeBuilder from './builders/typeBuilder';
import LabelBuilder from './builders/labelBuilder';

const getActivity = async (ticketId) => {
  const res = await request(app.application).get(`/api/v2/activities/${ticketId}`).expect(200);
  return res.body;
};

describe('Ticket Activity Tests', () => {
  it('should create activity for title change', async () => {
    const ticket = await new TicketBuilder().save();
    const updatedTitle = 'New Title';

    await request(app.application)
      .put(`/api/v2/tickets/${ticket._id}`)
      .send({ title: updatedTitle })
      .expect(200);

    const activities = await getActivity(ticket._id);
    const activity = activities.find((a) => a.field === 'Title');
    expect(activity.afterValues).toContain(updatedTitle);
  });

  it('should create activity for priority change', async () => {
    const ticket = await new TicketBuilder().save();
    const updatedPriority = 'High';

    await request(app.application)
      .put(`/api/v2/tickets/${ticket._id}`)
      .send({ priority: updatedPriority })
      .expect(200);

    const activities = await getActivity(ticket._id);
    const activity = activities.find((a) => a.field === 'Priority');
    expect(activity.afterValues).toContain(updatedPriority);
  });

  it('should create activity for story point change', async () => {
    const ticket = await new TicketBuilder().save();
    const updatedStoryPoint = 8;

    await request(app.application)
      .put(`/api/v2/tickets/${ticket._id}`)
      .send({ storyPoint: updatedStoryPoint })
      .expect(200);

    const activities = await getActivity(ticket._id);
    const activity = activities.find((a) => a.field === 'Story Point');
    expect(activity.afterValues).toContain(updatedStoryPoint.toString());
  });

  it('should create activity for due date change', async () => {
    const ticket = await new TicketBuilder().save();
    const updatedDueAt = new Date().toISOString();

    await request(app.application)
      .put(`/api/v2/tickets/${ticket._id}`)
      .send({ dueAt: updatedDueAt })
      .expect(200);

    const activities = await getActivity(ticket._id);
    const activity = activities.find((a) => a.field === 'Due At');
    expect(activity.afterValues[0]).toContain(updatedDueAt);
  });

  it('should create activity for status change', async () => {
    const newStatus = await new StatusBuilder()
      .withName('New Status')
      .withSlug('new-status')
      .save();
    const ticket = await new TicketBuilder().save();

    await request(app.application)
      .put(`/api/v2/tickets/${ticket._id}`)
      .send({ status: newStatus._id })
      .expect(200);

    const activities = await getActivity(ticket._id);
    const activity = activities.find((a) => a.field === 'Status');
    expect(activity.afterValues).toContain(newStatus.name);
  });

  it('should create activity for type change', async () => {
    const newType = await new TypeBuilder().withName('NewType').withSlug('new-type').save();
    const ticket = await new TicketBuilder().save();

    await request(app.application)
      .put(`/api/v2/tickets/${ticket._id}`)
      .send({ type: newType._id })
      .expect(200);

    const activities = await getActivity(ticket._id);
    const activity = activities.find((a) => a.field === 'Type');
    expect(activity.afterValues).toContain(newType.name);
  });

  it('should create activity for assign change', async () => {
    const ticket = await new TicketBuilder().save();
    const defaultUser = db.defaultUser;

    await request(app.application)
      .put(`/api/v2/tickets/${ticket._id}`)
      .send({ assign: defaultUser._id })
      .expect(200);

    const activities = await getActivity(ticket._id);
    const activity = activities.find((a) => a.field === 'Assign');
    expect(activity.afterValues).toContain(defaultUser.name);
  });

  it('should create activity for labels change', async () => {
    const label = await new LabelBuilder().withName('Urgent').withSlug('urgent').save();

    const ticket = await new TicketBuilder().save();

    await request(app.application)
      .put(`/api/v2/tickets/${ticket._id}`)
      .send({ labels: [label._id] })
      .expect(200);

    const activities = await getActivity(ticket._id);
    const activity = activities.find((a) => a.field === 'Labels');
    expect(activity.afterValues).toContain(label.name);
  });
});
