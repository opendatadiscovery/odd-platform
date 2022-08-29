import { expect } from 'chai';

import Button from '../elements/button';
import InputField from '../elements/input-field';

import BasePage from './base-page';

const SELECTORS = {
  sign_in_with_okta: 'text=Sign in with Okta',
  username: '#username',
  password: '#password',
  sign_in: `//button[text()='Sign in']`,
};

export default class LoginPage extends BasePage {
  get username() {
    return new InputField(this.page, SELECTORS.username);
  }

  get password() {
    return new InputField(this.page, SELECTORS.password);
  }

  get sign_in() {
    return new Button(this.page, SELECTORS.sign_in);
  }

  get sign_in_with_okta() {
    return new Button(this.page, SELECTORS.sign_in_with_okta);
  }

  async login({ username, password }: { username: string; password: string }) {
    await this.username.type(username);
    await this.password.type(password);
    const [response] = await Promise.all([
      this.page.waitForResponse(
        response => response.url().includes('auth/login') && response.request().method() === 'POST',
      ),
      this.sign_in.click(),
    ]);

    expect(response.status(), `Request auth/login should have status of 200`).to.eql(200);

    return username;
  }
}
