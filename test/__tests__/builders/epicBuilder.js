import * as Epic from '../../../src/app/model/epic';
import db from '../../setup/db';
import BaseBuilder from './baseBuilder';
import ProjectBuilder from './projectBuilder';

export default class EpicBuilder extends BaseBuilder {
  constructor(defaultValues = true) {
    super(defaultValues);
  }

  withTitle(title) {
    this.properties.title = title;
    return this;
  }

  withProject(project) {
    this.properties.project = project._id;
    return this;
  }

  withTenant(tenant) {
    this.properties.tenant = tenant;
    return this;
  }

  withColor(color) {
    this.properties.color = color;
    return this;
  }

  withDescription(description) {
    this.properties.description = description;
    return this;
  }

  withStartDate(startDate) {
    this.properties.startDate = startDate;
    return this;
  }

  withDueAt(dueAt) {
    this.properties.dueAt = dueAt;
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

  withIsComplete(isComplete) {
    this.properties.isComplete = isComplete;
    return this;
  }

  withIsActive(isActive) {
    this.properties.isActive = isActive;
    return this;
  }

  withGoal(goal) {
    this.properties.goal = goal;
    return this;
  }

  withAttachmentUrls(attachmentUrls) {
    this.properties.attachmentUrls = attachmentUrls;
    return this;
  }

  async buildDefault() {
    const project = await new ProjectBuilder().save();
    return {
      title: 'Epic Title',
      project: project._id,
      tenant: db.tenantId,
    };
  }

  build() {
    return {
      title: this.properties.title,
      project: this.properties.project,
      tenant: this.properties.tenant,
    };
  }

  async save() {
    return super.save(Epic.getModel(db.dbConnection));
  }
}
