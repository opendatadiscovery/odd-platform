import CustomElement from './custom-element';

export default class Button extends CustomElement {
  /**
   * Checks if element is disabled
   */
  async isDisabled() {
    try {
      await this.customElement.waitFor({ timeout: 12000 });

      return await this.customElement.isDisabled();
    } catch {
      return this.customElement.isDisabled();
    }
  }

  /**
   * Clicks on element
   *
   * @param op
   * @param op.position
   * @param op.position.x
   * @param op.position.y
   */
  async click(op?: { position: { x: number; y: number } }) {
    await this.waitForElementToBeVisible();
    await this.customElement.click(op);
  }
}
