import { Locator, Page } from '@playwright/test';

import CustomElement from './custom-element';

const SELECTORS = {
  dropdown_item_by_partial_text: (dropdown_item, menu_inner_text) =>
    `${dropdown_item}:has-text("${menu_inner_text}")`,
  dropdown_item_by_exact_text: (dropdown_item, menu_inner_text) =>
    `${dropdown_item} :text-is("${menu_inner_text}")`,
  placeholder_value: 'div[class*="-placeholder"]',
  input_value: 'div[class*="-singleValue"]',
};
export default class Dropdown extends CustomElement {
  private readonly dropdown: Locator;
  private readonly dropdown_item: string;

  constructor(
    context: Page,
    anchor: string | Locator,
    dropdown = 'div[class$="-menu"]',
    dropdown_item = 'div[id*="option"]',
  ) {
    super(context, anchor);

    this.dropdown = this.context.locator(dropdown);
    this.dropdown_item = dropdown_item;
  }

  get inner_text() {
    return this.custom_element.innerText();
  }

  get placeholder() {
    return this.custom_element.locator(SELECTORS.placeholder_value).innerText();
  }

  /**
   * Filters the dropdown menu items by text or ordering index
   * @param identifier
   * @returns
   */
  private async get_menu_item_by_index_or_text(identifier: number | string, exact: boolean) {
    let dropdown_item: Locator;

    await this.dropdown.waitFor();

    if (typeof identifier === 'number') {
      dropdown_item = this.dropdown.locator(this.dropdown_item).nth(identifier);
    } else {
      dropdown_item = this.dropdown.locator(
        exact
          ? SELECTORS.dropdown_item_by_exact_text(this.dropdown_item, identifier)
          : SELECTORS.dropdown_item_by_partial_text(this.dropdown_item, identifier),
      );
    }

    await dropdown_item.waitFor();

    return dropdown_item;
  }

  /**
   * Opens a dropdown
   */
  async open() {
    await this.custom_element.waitFor();
    await this.custom_element.click();
  }

  /**
   * Choose the particular value from the dropdown
   * @param menu_item
   * @param identifier
   * @param open
   */
  async set(
    identifier: string | number | number[] | string[],
    { open = true, exact = false }: DropdownSetOptions = {},
  ) {
    if (open) await this.open();

    if (Array.isArray(identifier)) {
      for (const item of identifier) await this.set(item, { open: false, exact });
    } else {
      await (await this.get_menu_item_by_index_or_text(identifier, exact)).click();
    }
  }

  /**
   * Types the value in the Dropdown's input field
   * @param value
   */
  async type(value: string) {
    await this.wait_for_element_to_be_visible();
    await this.find('input[type="text"]').type(value);
    await this.custom_element.press('Enter');
  }
}

interface DropdownSetOptions {
  open?: boolean;
  exact?: boolean;
}
