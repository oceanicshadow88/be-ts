import * as User from '../../../src/app/model/user';
import db from '../../setup/db';
import BaseBuilder from './baseBuilder';
//inherit
export default class UserBuilder extends BaseBuilder {
  constructor(defaultValues = true) {
    super(defaultValues, false);
  }

  withEmail(email) {
    this.properties.email = email;
    return this;
  }

  withName(name) {
    this.properties.name = name;
    return this;
  }

  withPassword(password) {
    this.properties.password = password;
    return this;
  }

  withActive(active) {
    this.properties.active = active;
    return this;
  }

  build() {
    return {
      email: this.properties.email,
      name: this.properties.name,
      password: this.properties.password,
      active: this.properties.active,
    };
  }

  buildDefault() {
    return {
      email: 'techscrum@gmail.com',
      name: 'Default User',
      password: 'password123',
      active: true,
    };
  }

  save() {
    return super.save(User.getModel(db.tenantsConnection));
  }
}
