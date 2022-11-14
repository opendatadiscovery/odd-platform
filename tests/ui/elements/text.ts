import CustomElement from './custom-element';

export default class Text extends CustomElement {
  /**
   * Checks if the alert is visible
   */
  async isVisible(): Promise<boolean> {
    await this.customElement.waitFor({ state: 'visible' });
    return this.customElement.isVisible();
  }

  /**
   * Checks if the alert is hidden
   */
  async isHidden(): Promise<boolean> {
    await this.customElement.waitFor({ state: 'hidden' });
    return this.customElement.isHidden();
  }
}
