import { Locator, Page } from '@playwright/test';

import CustomElement from './custom-element';

const SELECTORS = {
  dropdownItemByPartialText: (dropdownItem, menuInnerText) =>
    `${dropdownItem}:has-text("${menuInnerText}")`,
  dropdownItemByExactText: (dropdownItem, menuInnerText) =>
    `${dropdownItem} :text-is("${menuInnerText}")`,
  placeholderValue: 'div[class*="-placeholder"]',
  inputValue: 'div[class*="-singleValue"]',
};
export default class Dropdown extends CustomElement {
  private readonly dropdown: Locator;

  private readonly dropdownItem: string;

  constructor(
    context: Page,
    anchor: string | Locator,
    dropdown = 'div[class$="-menu"]',
    dropdownItem = 'div[id*="option"]',
  ) {
    super(context, anchor);

    this.dropdown = this.context.locator(dropdown);
    this.dropdownItem = dropdownItem;
  }

  get innerText() {
    return this.customElement.innerText();
  }

  get placeholder() {
    return this.customElement.locator(SELECTORS.placeholderValue).innerText();
  }

  /**
   * Filters the dropdown menu items by text or ordering index
   *
   * @param identifier
   * @param exact
   * @returns
   */
  private async getMenuItemByIndexOrText(identifier: number | string, exact: boolean) {
    let dropdownItem: Locator;

    await this.dropdown.waitFor();

    if (typeof identifier === 'number') {
      dropdownItem = this.dropdown.locator(this.dropdownItem).nth(identifier);
    } else {
      dropdownItem = this.dropdown.locator(
        exact
          ? SELECTORS.dropdownItemByExactText(this.dropdownItem, identifier)
          : SELECTORS.dropdownItemByPartialText(this.dropdownItem, identifier),
      );
    }

    await dropdownItem.waitFor();

    return dropdownItem;
  }

  /**
   * Opens a dropdown
   */
  async open() {
    await this.customElement.waitFor();
    await this.customElement.click();
  }

  /**
   * Choose the particular value from the dropdown
   *
   * @param menuItem
   * @param identifier
   * @param identifier.open
   * @param open
   * @param identifier.exact
   */
  async set(
    identifier: string | number | number[] | string[],
    { open = true, exact = false }: DropdownSetOptions = {},
  ) {
    if (open) await this.open();

    if (Array.isArray(identifier)) {
      for (const item of identifier) await this.set(item, { open: false, exact });
    } else {
      await (await this.getMenuItemByIndexOrText(identifier, exact)).click();
    }
  }

  /**
   * Types the value in the Dropdown's input field
   *
   * @param value
   */
  async type(value: string) {
    await this.waitForElementToBeVisible();
    await this.find('input[type="text"]').type(value);
    await this.customElement.press('Enter');
  }
}

interface DropdownSetOptions {
  open?: boolean;
  exact?: boolean;
}
