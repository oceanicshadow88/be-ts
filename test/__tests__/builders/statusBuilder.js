import * as Status from '../../../src/app/model/status';
import db from '../../setup/db';
import BaseBuilder from './baseBuilder';
import { DEFAULT_STATUS } from '../../../src/app/database/seeders/statusSeeder';

export default class StatusBuilder extends BaseBuilder {
  constructor(defaultValues = true) {
    super(defaultValues);
  }

  withName(name) {
    this.properties.name = name;
    return this;
  }

  withSlug(slug) {
    this.properties.slug = slug;
    return this;
  }

  withTenant(tenant) {
    this.properties.tenant = tenant;
    return this;
  }

  withIsDefault(isDefault) {
    this.properties.isDefault = isDefault;
    return this;
  }

  async buildDefault() {
    return {
      name: 'To Do',
      slug: 'to-do',
      tenant: db.tenantId,
      isDefault: true,
    };
  }

  build() {
    return {
      name: this.properties.name,
      slug: this.properties.slug,
      tenant: this.properties.tenant,
      isDefault: this.properties.isDefault ?? false,
    };
  }

  async save() {
    return super.save(Status.getModel(db.dbConnection));
  }

  static async createDefaultStatuses() {
    const StatusModel = Status.getModel(db.dbConnection);

    const saved = [];

    for (const status of DEFAULT_STATUS) {
      const existing = await StatusModel.findOne({ slug: status.slug, tenant: db.tenantId });
      if (existing) {
        saved.push(existing);
      } else {
        const newStatus = await new StatusBuilder()
          .withName(status.name)
          .withSlug(status.slug)
          .withIsDefault(status.isDefault)
          .withTenant(db.tenantId)
          .save();
        saved.push(newStatus);
      }
    }

    return saved;
  }
}
