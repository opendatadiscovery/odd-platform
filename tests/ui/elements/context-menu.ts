import { Locator, Page } from '@playwright/test';

import CustomElement from './custom-element';

export default class ContextMenu extends CustomElement {
  private readonly anchor: Locator;

  constructor(
    context: Page,
    anchor_locator: string | Locator = '.rc-menu-button',
    root_selector: string | Locator = '[role="menu"]',
    private readonly items_selector = '[role="menuitem"]',
  ) {
    super(context, root_selector);

    this.anchor = this.get_locator(anchor_locator);
  }

  /**
   * Click the Context menu item
   *
   * @param item_name
   * @param open if false - does not open the context menu
   */
  async click(item_name: string, open = true) {
    if (open) {
      await this.open();
    }
    await this.custom_element.waitFor();

    const menu_item = this.custom_element.locator(
      `${this.items_selector}:has-text("${item_name}")`,
    );

    await menu_item.waitFor();
    await menu_item.click();
  }

  /**
   * Opens the context menu
   */
  async open() {
    await this.anchor.waitFor();
    await this.anchor.click();
  }

  /**
   * Closes the context menu
   */
  async close() {
    await this.open();
  }
}
