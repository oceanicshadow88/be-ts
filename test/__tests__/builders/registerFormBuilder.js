export default class RegisterFormBuilder {
  constructor() {
    this.data = {};
  }

  withEmail(email) {
    this.data.email = email;
    return this;
  }

  withCompany(company) {
    this.data.company = company;
    return this;
  }

  withName(name) {
    this.data.name = name;
    return this;
  }

  withPassword(password) {
    this.data.password = password;
    return this;
  }

  build() {
    return { ...this.data };
  }

  static validForm() {
    return new RegisterFormBuilder()
      .withEmail('test@example.com')
      .withCompany('validcompany')
      .build();
  }

  static invalidEmailForm() {
    return new RegisterFormBuilder().withEmail('invalid-email').withCompany('validcompany').build();
  }

  static invalidCompanyForm() {
    return new RegisterFormBuilder().withEmail('test@example.com').withCompany('api').build();
  }

  static emptyForm() {
    return {};
  }
}
