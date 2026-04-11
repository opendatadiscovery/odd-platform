import { Locator, Page } from '@playwright/test';

import CustomElement from './custom-element';

export default class ContextMenu extends CustomElement {
  private readonly anchor: Locator;

  constructor(
    context: Page,
    anchorLocator: string | Locator = '.rc-menu-button',
    rootSelector: string | Locator = '[role="menu"]',
    private readonly itemsSelector = '[role="menuitem"]',
  ) {
    super(context, rootSelector);

    this.anchor = this.getLocator(anchorLocator);
  }

  /**
   * Click the Context menu item
   *
   * @param itemName
   * @param open if false - does not open the context menu
   */
  async click(itemName: string, open = true) {
    if (open) {
      await this.open();
    }
    await this.customElement.waitFor();

    const menuItem = this.customElement.locator(`${this.itemsSelector}:has-text("${itemName}")`);

    await menuItem.waitFor();
    await menuItem.click();
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
