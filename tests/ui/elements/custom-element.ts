import { Locator, Page } from '@playwright/test';

export default class CustomElement {
  constructor(protected readonly context: Page, customElement: string | Locator) {
    this.customElementContext = this.getLocator(customElement);
  }

  /**
   * @returns Returns locator of the matching element
   */
  get locator(): Locator {
    return this.customElementContext;
  }

  private customElementContext: Locator;

  /**
   * Returns a locator even if string selector is passed as a parameter
   *
   * @param element
   * @returns Locator
   */
  protected getLocator(element: string | Locator): Locator {
    return typeof element === 'string' ? this.context.locator(element) : element;
  }

  /**
   * Gets the customElement as proxied class
   */
  protected get customElement(): Locator {
    return this.customElementContext;
  }

  /**
   * Sets the customElementContext to desired element
   */
  protected set customElement(customElement: Locator) {
    this.customElementContext = customElement;
  }

  /**
   * Hovers the target element
   */
  async hover() {
    await this.customElement.hover();
  }

  /**
   * Gets bounding box of the target element
   *
   * @returns
   */
  async boundingBox() {
    return this.customElement.boundingBox();
  }

  /**
   * Get the elements attribute
   *
   * @param attribute
   * @returns
   */
  async getAttribute(attribute: string) {
    await this.waitForElementToBeVisible();

    return this.customElement.getAttribute(attribute);
  }

  /**
   * Searches for the child element
   *
   * @param locator
   */
  find(locator: string) {
    return this.customElement.locator(locator);
  }

  /**
   * Checks if element is visible
   */
  async isVisible() {
    try {
      await this.customElement.waitFor({ timeout: 12000 });

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for element to be visible on the page within global timeout
   *
   * @param timeout
   */
  async waitForElementToBeVisible(timeout = 90000) {
    await this.customElement.waitFor({ timeout });
  }

  /**
   * Wait for element to be firstly attached to the DOM and then detached
   */
  async waitForFading() {
    await this.customElement.waitFor();
    await this.customElement.waitFor({ state: 'detached' });
  }

  /**
   * Waits until loading spinner will be detached from the DOM
   *
   * @param retries
   */
  async waitUntilLoaded(retries = 15) {
    await this.context.waitForSelector('svg[class="ui/loading-spinner"]', {
      state: 'detached',
    });

    if (retries) await this.waitUntilLoaded(retries - 1);
  }
}
