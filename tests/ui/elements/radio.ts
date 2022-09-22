import CustomElement from './custom-element';

export default class Radio extends CustomElement {
  /**
   * Clicks on the toggle
   */
  async click() {
    await this.wait_for_element_to_be_visible();
    await this.custom_element.click();
  }
}
