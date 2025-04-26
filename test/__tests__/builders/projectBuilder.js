import * as Project from '../../../src/app/model/project';
import db from '../../setup/db';
import BaseBuilder from './baseBuilder';

export default class ProjectBuilder extends BaseBuilder {
  constructor(defaultValues = true) {
    super(defaultValues);
  }

  withName(name) {
    this.properties.name = name;
    return this;
  }

  withKey(key) {
    this.properties.key = key;
    return this;
  }

  withOwner(owner) {
    this.properties.owner = owner;
    return this;
  }

  withProjectLead(projectLead) {
    this.properties.projectLead = projectLead;
    return this;
  }

  withIconUrl(iconUrl) {
    this.properties.iconUrl = iconUrl;
    return this;
  }

  withUserId(userId) {
    this.properties.userId = userId;
    return this;
  }

  withDescription(description) {
    this.properties.description = description;
    return this;
  }

  buildDefault() {
    return {
      name: 'project',
      projectLead: db.defaultUser._id,
      owner: db.defaultUser._id,
      userId: db.defaultUser._id,
      key: 'PRO',
    };
  }

  build() {
    return {
      name: this.properties.name,
      projectLead: this.properties.projectLead,
      owner: this.properties.owner,
      key: this.properties.key,
      userId: db.defaultUser._id,
    };
  }

  async save() {
    return super.save(Project.getModel(db.dbConnection));
  }
}
