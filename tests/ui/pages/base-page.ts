import { configuration } from '../../config/configuration';
import { odd } from '../../config/environments.json';
import Button from '../elements/button';
import TextBox from '../elements/text-box';

import { Pages } from './index';

const SELECTORS = {
  toastMessage: 'div[class*="toastText"]',
};

export default class BasePage {
  constructor(protected readonly pages: Pages, protected readonly page = pages.page) {}

  /**
   *
   * @param locator
   */
  protected locator(locator: string) {
    return this.page.locator(locator);
  }

  get url() {
    return this.page.url();
  }

  get toastMessage() {
    return new TextBox(this.page, SELECTORS.toastMessage);
  }

  get body() {
    return new Button(this.page, 'body');
  }

  /**
   *
   * @param url
   */
  buildUrl(url: string) {
    return odd[configuration.environment].replace('/login', url);
  }
}
