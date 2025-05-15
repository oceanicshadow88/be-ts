import * as Ticket from '../../../src/app/model/ticket';
import db from '../../setup/db';
import BaseBuilder from './baseBuilder';
import ProjectBuilder from './projectBuilder';
import TypeBuilder from './typeBuilder';

export default class TicketBuilder extends BaseBuilder {
  constructor(defaultValues = true) {
    super(defaultValues);
  }

  withTitle(title) {
    this.properties.title = title;
    return this;
  }

  withStatus(status) {
    this.properties.status = status;
    return this;
  }

  withProject(project) {
    this.properties.project = project._id;
    return this;
  }

  withType(type) {
    this.properties.type = type;
    return this;
  }

  withReporter(reporter) {
    this.properties.reporter = reporter;
    return this;
  }

  withAssign(assign) {
    this.properties.assign = assign;
    return this;
  }

  withLabels(labels) {
    this.properties.labels = labels;
    return this;
  }

  withDescription(description) {
    this.properties.description = description;
    return this;
  }

  withStoryPoint(points) {
    this.properties.storyPoint = points;
    return this;
  }

  withDueAt(dueAt) {
    this.properties.dueAt = dueAt;
    return this;
  }

  withPriority(priority) {
    this.properties.priority = priority;
    return this;
  }

  withSprint(sprintId) {
    this.properties.sprintId = sprintId;
    return this;
  }

  withEpic(epicId) {
    this.properties.epic = epicId;
    return this;
  }

  withAttachmentUrls(urls) {
    this.properties.attachmentUrls = urls;
    return this;
  }

  async buildDefault() {
    const project = await new ProjectBuilder().save();
    const type = await TypeBuilder.createDefaultTypes();
    return {
      title: 'Default Ticket Title',
      project: project._id,
      reporter: db.defaultUser._id,
      // assign: db.defaultUser._id,
      description: 'Default description',
      type: type[0]._id,
    };
  }

  build() {
    return {
      ...this.properties,
    };
  }

  async save() {
    return super.save(Ticket.getModel(db.dbConnection));
  }
}
