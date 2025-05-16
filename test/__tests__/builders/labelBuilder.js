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
}
