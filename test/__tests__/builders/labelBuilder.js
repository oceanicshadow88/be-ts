import * as Label from '../../../src/app/model/label';
import db from '../../setup/db';
import BaseBuilder from './baseBuilder';

export default class LabelBuilder extends BaseBuilder {
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

  async buildDefault() {
    return {
      name: 'Default Label',
      slug: 'default-label',
      tenant: db.tenantId,
    };
  }

  build() {
    return {
      name: this.properties.name,
      slug: this.properties.slug,
      tenant: this.properties.tenant,
    };
  }

  async save() {
    return super.save(Label.getModel(db.dbConnection));
  }

  static async createDefaultLabels() {
    const LabelModel = Label.getModel(db.dbConnection);

    const existing = await LabelModel.findOne({ slug: 'default-label', tenant: db.tenantId });
    if (existing) {
      return existing;
    }

    return new LabelBuilder().withName('Default Label').withSlug('default-label').save();
  }
}
