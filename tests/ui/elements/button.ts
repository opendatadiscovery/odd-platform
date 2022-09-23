import CustomElement from './custom-element';

export default class Button extends CustomElement {
  /**
   * Checks if element is disabled
   */
  async is_disabled() {
    try {
      await this.custom_element.waitFor({ timeout: 12000 });

      return await this.custom_element.isDisabled();
    } catch {
      return this.custom_element.isDisabled();
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
    await this.wait_for_element_to_be_visible();
    await this.custom_element.click(op);
  }
}
