import { Locator } from '@playwright/test';

import Button from '../../elements/button';
import TextBox from '../../elements/text-box';
import { Pages } from '..';
import BasePage from '../base-page';

const SELECTORS = {
  title: `[class*="ModalCardTitle"]`,
  save_button: `button:has-text("Save")`,
  cancel_button: `button:has-text("Cancel")`,
};

export default class BaseModal extends BasePage {
  protected readonly modal: Locator;

  constructor(pages: Pages, modal_selector: string) {
    super(pages);

    this.modal = this.page.locator(`${modal_selector}`);
  }

  /**
   *
   */
  async is_opened() {
    // ToDo: modify to use CustomElement and is_visible
    try {
      await this.modal.waitFor({ timeout: 12000 });

      return true;
    } catch {
      return false;
    }
  }

  /**
   *
   */
  get title() {
    return new TextBox(this.page, this.modal.locator(SELECTORS.title));
  }

  /**
   *
   */
  get cancel() {
    return new Button(this.page, this.modal.locator(SELECTORS.cancel_button));
  }
}
