import { Locator, Page } from '@playwright/test';

export default class CustomElement {
  private custom_element_context: Locator;

  /**
   * Returns a locator even if string selector is passed as a parameter
   *
   * @param element
   * @returns Locator
   */
  protected get_locator(element: string | Locator): Locator {
    return typeof element === 'string' ? this.context.locator(element) : element;
  }

  /**
   * Gets the custom_element as proxied class
   */
  protected get custom_element(): Locator {
    return this.as_proxy();
  }

  /**
   * Sets the custom_element_context to desired element
   */
  protected set custom_element(custom_element: Locator) {
    this.custom_element_context = custom_element;
  }

  constructor(protected readonly context: Page, custom_element: string | Locator) {
    this.custom_element_context = this.get_locator(custom_element);
  }

  /**
   * Wraps the custom_element_context in a Proxy class to dynamically deal with loading status before and after each PW command
   */
  private as_proxy() {
    const page_context = this.context;

    return new Proxy(this.custom_element_context, {
      get(target, prop_name) {
        if (
          (prop_name in target && prop_name === 'locator') ||
          typeof target[prop_name] !== 'function'
        ) {
          return target[prop_name];
        }
        return async (...args) => {
          let loaded = false;

          while (!loaded) {
            try {
              await page_context.waitForSelector('div[class="loadingContainer"]', {
                state: 'attached',
                timeout: 1000,
              });

              loaded = false;
            } catch {
              loaded = true;
            }
          }

          const resolved = await target[prop_name](...args);

          return resolved;
        };
      },
    });
  }

  /**
   * Hovers the target element
   */
  async hover() {
    await this.custom_element.hover();
  }

  /**
   * Gets bounding box of the target element
   *
   * @returns
   */
  async bounding_box() {
    return this.custom_element.boundingBox();
  }

  /**
   * Get the elements attribute
   *
   * @param attribute
   * @returns
   */
  async get_attribute(attribute: string) {
    await this.wait_for_element_to_be_visible();

    return this.custom_element.getAttribute(attribute);
  }

  /**
   * Searches for the child element
   *
   * @param locator
   */
  find(locator: string) {
    return this.custom_element.locator(locator);
  }

  /**
   * Checks if element is visible
   */
  async is_visible() {
    try {
      await this.custom_element.waitFor({ timeout: 12000 });

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
  async wait_for_element_to_be_visible(timeout = 90000) {
    await this.custom_element.waitFor({ timeout });
  }

  /**
   * Wait for element to be firstly attached to the DOM and then detached
   */
  async wait_for_fading() {
    await this.custom_element.waitFor();
    await this.custom_element.waitFor({ state: 'detached' });
  }

  /**
   * Waits until loading spinner will be detached from the DOM
   *
   * @param retries
   */
  async wait_until_loaded(retries = 15) {
    await this.context.waitForSelector('svg[class="ui/loading-spinner"]', {
      state: 'detached',
    });

    if (retries) await this.wait_until_loaded(retries - 1);
  }
}
