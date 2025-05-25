import request from 'supertest';
import ProjectBuilder from './builders/projectBuilder';
import app from '../setup/app';

describe('Project Test', () => {
  it('get projects, should get projects', async () => {
    const project = await new ProjectBuilder().save();
    const res = await request(app.application).get('/api/v2/projects').expect(200);
    expect(res.body[0].id).toEqual(project.id);
    expect(res.body[0].name).toEqual(project.name);
  });

  it('get project, should get project', async () => {
    const project = await new ProjectBuilder().save();
    const res = await request(app.application).get(`/api/v2/projects/${project.id}`).expect(200);
    expect(res.body.id).toEqual(project.id);
    expect(res.body.name).toEqual(project.name);
  });

  it('create project, should create project', async () => {
    const project = new ProjectBuilder().buildDefault();
    const res = await request(app.application)
      .post('/api/v2/projects')
      .send({ ...project });
    expect(res.body._id).toEqual(project.id);
    expect(res.body.name).toEqual(project.name);
  });

  it('update project, should update project', async () => {
    const updatedName = 'haha';
    const project = await new ProjectBuilder().save();
    expect(project.name).toEqual('project');
    const res = await request(app.application)
      .put(`/api/v2/projects/${project.id}`)
      .send({ name: updatedName });
    expect(res.body.id).toEqual(project.id);
    expect(res.body.name).toEqual(updatedName);
  });

  it('delete project, should delete project', async () => {
    const project = await new ProjectBuilder().save();
    await request(app.application).delete(`/api/v2/projects/${project.id}`).expect(200);
  });

  it('create project, should return 422 when missing name', async () => {
    const project = new ProjectBuilder(false).buildDefault();
    await request(app.application)
      .post('/api/v2/projects')
      .send({ ...project, ...{ name: null } })
      .expect(422);
  });

  it('create project, should return 422 when missing key', async () => {
    const project = new ProjectBuilder(false).buildDefault();
    await request(app.application)
      .post('/api/v2/projects')
      .send({ ...project, ...{ key: null } })
      .expect(422);
  });

  it('should get project details', async () => {
    const project = await new ProjectBuilder().save();
    const res = await request(app.application).get(`/api/v2/projects/${project.id}/details`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        labels: [],
        users: [],
        ticketTypes: [],
        sprints: [],
        statuses: [],
        boards: [],
        epics: [],
        details: expect.objectContaining({
          id: project.id,
          name: project.name,
          key: project.key,
          projectLead: project.projectLead.toString(),
          owner: project.owner.toString(),
          tenant: project.tenant.toString(),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
        retroBoards: [],
      })
    );
  });

});
