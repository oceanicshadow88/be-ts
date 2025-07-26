import * as Sprint from '../../../src/app/model/sprint';
import db from '../../setup/db';
import BaseBuilder from './baseBuilder';
import ProjectBuilder from './projectBuilder';

export default class SprintBuilder extends BaseBuilder {
  constructor(defaultValues = true) {
    super(defaultValues);
  }

  withName(name) {
    this.properties.name = name;
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

  withStartDate(startDate) {
    this.properties.startDate = startDate;
    return this;
  }

  withEndDate(endDate) {
    this.properties.endDate = endDate;
    return this;
  }

  withGoal(goal) {
    this.properties.goal = goal;
    return this;
  }

  withIsActive(isActive) {
    this.properties.isActive = isActive;
    return this;
  }

  async buildDefault() {
    const project = await new ProjectBuilder().save();
    return {
      name: 'Sprint Title',
      project: project._id,
      tenant: db.defaultTenant._id,
    };
  }

  build() {
    return {
      name: this.properties.name,
      project: this.properties.project,
      tenant: this.properties.tenant,
      startDate: this.properties.startDate,
      endDate: this.properties.endDate,
      goal: this.properties.goal,
      isActive: this.properties.isActive ?? false,
    };
  }

  async save() {
    return super.save(Sprint.getModel(db.dbConnection));
  }
}
