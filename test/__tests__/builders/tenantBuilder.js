import * as Tenant from '../../../src/app/model/tenants';
import db from '../../setup/db';
import BaseBuilder from './baseBuilder';

export default class TenantBuilder extends BaseBuilder {
  constructor(defaultValues = true) {
    super(defaultValues, false);
  }

  withOrigin(origin) {
    this.properties.origin = origin;
    return this;
  }

  withPlan(plan) {
    this.properties.plan = plan;
    return this;
  }

  withOwner(owner) {
    this.properties.owner = owner;
    return this;
  }

  withActive(active) {
    this.properties.active = active;
    return this;
  }

  build() {
    return {
      origin: this.properties.origin,
      plan: this.properties.plan,
      owner: this.properties.owner,
      active: this.properties.active,
    };
  }

  buildDefault() {
    return {
      origin: 'http://test.com',
      plan: 'Free',
      owner: 'Default Owner',
      active: true,
    };
  }

  save() {
    return super.save(Tenant.getModel(db.tenantsConnection));
  }
}