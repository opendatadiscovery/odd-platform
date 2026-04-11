import CustomElement from './custom-element';

export default class Toggle extends CustomElement {
  /**
   * Clicks on the toggle
   */
  async click() {
    await this.waitForElementToBeVisible();
    await this.customElement.click();
  }
}
