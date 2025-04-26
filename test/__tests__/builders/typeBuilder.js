import * as Type from '../../../src/app/model/type';
import db from '../../setup/db';
import BaseBuilder from './baseBuilder';
import { TICKET_TYPES } from '../../../src/app/database/init';

export default class TypeBuilder extends BaseBuilder {
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

  withIcon(icon) {
    this.properties.icon = icon;
    return this;
  }

  async buildDefault() {
    return {
      name: 'Task',
      slug: 'task',
      icon: 'https://010001.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10321?size=medium',
    };
  }

  build() {
    return {
      name: this.properties.name,
      slug: this.properties.slug,
      icon: this.properties.icon,
    };
  }

  async save() {
    return super.save(Type.getModel(db.dbConnection));
  }

  static async createDefaultTypes() {
    const TypeModel = Type.getModel(db.dbConnection);

    const saved = [];
    for (const type of TICKET_TYPES) {
      const existing = await TypeModel.findOne({ slug: type.slug });
      if (existing) {
        saved.push(existing);
      } else {
        const newType = await new TypeBuilder().withName(type.name).withSlug(type.slug).save();
        saved.push(newType);
      }
    }
    return saved;
  }
}
