import CustomElement from './custom-element';

export default class InputField extends CustomElement {
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
   * Fills the input field immediately
   *
   * @param value
   */
  async fill(value: string) {
    await this.customElement.fill(value);
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
    await this.customElement.type(value, options);
  }

  /**
   * Gets the inner value of input field
   */
  async innerText() {
    await this.waitForElementToBeVisible();

    return this.customElement.inputValue();
  }

  /**
   * Press `key` for focused input field
   *
   * @param key
   */
  async press(key: 'Enter'): Promise<void> {
    await this.customElement.press(key);
  }
}
