import CustomElement from './custom-element';

export default class Checkbox extends CustomElement {
  /**
   * Clicks on the checkbox
   */
  async click() {
    await this.wait_for_element_to_be_visible();
    await this.custom_element.click();
  }
}
