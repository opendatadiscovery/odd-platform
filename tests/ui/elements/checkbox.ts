import CustomElement from './custom-element';

export default class Checkbox extends CustomElement {
  /**
   * Clicks on the checkbox
   */
  async click() {
    await this.waitForElementToBeVisible();
    await this.customElement.click();
  }
}
