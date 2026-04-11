import { expect } from 'chai';

import Button from '../elements/button';
import InputField from '../elements/input-field';

import BasePage from './base-page';

const SELECTORS = {
  signInWithOkta: 'text=Sign in with Okta',
  username: '#username',
  password: '#password',
  signIn: `//button[text()='Sign in']`,
};

export default class LoginPage extends BasePage {
  get username() {
    return new InputField(this.page, SELECTORS.username);
  }

  get password() {
    return new InputField(this.page, SELECTORS.password);
  }

  get signIn() {
    return new Button(this.page, SELECTORS.signIn);
  }

  get signInWithOkta() {
    return new Button(this.page, SELECTORS.signInWithOkta);
  }

  async login({ username, password }: { username: string; password: string }) {
    await this.username.type(username);
    await this.password.type(password);
    const [response] = await Promise.all([
      this.page.waitForResponse(
        response => response.url().includes('auth/login') && response.request().method() === 'POST',
      ),
      this.signIn.click(),
    ]);

    expect(response.status(), `Request auth/login should have status of 200`).to.eql(200);

    return username;
  }
}
