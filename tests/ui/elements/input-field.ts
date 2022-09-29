import CustomElement from './custom-element';

export default class InputField extends CustomElement {
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
   * Fills the input field immediately
   *
   * @param value
   */
  async fill(value: string) {
    await this.custom_element.fill(value);
  }

  /**
   * Type the value in the input field with delay
   *
   * @param value
   * @param options
   * @param options.delay
   * @param options.noWaitAfter
   * @param options.timeout
   */
  async type(
    value: string,
    options: {
      delay?: number;
      noWaitAfter?: boolean;
      timeout?: number;
    } = { delay: 50 },
  ) {
    await this.custom_element.type(value, options);
  }

  /**
   * Gets the inner value of input field
   */
  async inner_text() {
    await this.wait_for_element_to_be_visible();

    return this.custom_element.inputValue();
  }

  /**
   * Press `key` for focused input field
   *
   * @param key
   */
  async press(key: 'Enter'): Promise<void> {
    await this.custom_element.press(key);
  }
}
