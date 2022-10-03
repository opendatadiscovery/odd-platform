import { Locator } from '@playwright/test';

import { Pages } from '..';
import Button from '../../elements/button';
import TextBox from '../../elements/text-box';
import BasePage from '../base-page';

const SELECTORS = {
  title: `[class*="ModalCardTitle"]`,
  saveButton: `button:has-text("Save")`,
  cancelButton: `button:has-text("Cancel")`,
};

export default class BaseModal extends BasePage {
  protected readonly modal: Locator;

  constructor(pages: Pages, modalSelector: string) {
    super(pages);

    this.modal = this.page.locator(`${modalSelector}`);
  }

  /**
   *
   */
  async isOpened() {
    // ToDo: modify to use CustomElement and isVisible
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
    return new Button(this.page, this.modal.locator(SELECTORS.cancelButton));
  }
}
