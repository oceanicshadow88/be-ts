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

  build() {
    return {
      email: this.properties.email,
      name: this.properties.name,
    };
  }

  buildDefault() {
    return {
      email: 'techscrum@gmail.com',
      name: 'Default User',
    };
  }

  save() {
    return super.save(User.getModel(db.tenantsConnection));
  }
}
