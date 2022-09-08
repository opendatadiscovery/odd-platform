import { odd } from '../../config/environments.json';
import { configuration } from '../../config/configuration';
import Button from '../elements/button';
import TextBox from '../elements/text-box';

import { Pages } from './index';

const SELECTORS = {
  toast_massage: 'div[class*="toastText"]',
};

export default class BasePage {
  constructor(protected readonly pages: Pages, protected readonly page = pages.page) {}

  /**
   *
   */
  protected locator(locator: string) {
    return this.page.locator(locator);
  }

  get url() {
    return this.page.url();
  }

  get toast_message() {
    return new TextBox(this.page, SELECTORS.toast_massage);
  }

  get body() {
    return new Button(this.page, 'body');
  }

  /**
   *
   */
  build_url(url: string) {
    // @ts-ignore
    return odd[configuration.environment].replace('/login', url);
  }
}
