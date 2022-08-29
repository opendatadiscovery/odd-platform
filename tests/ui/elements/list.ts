import { Locator, Page } from '@playwright/test';

import Button from './button';
import CustomElement from './custom-element';

const SELECTORS = {
  list_item_by_exact_match: (list_item_locator, identifier) =>
    `${list_item_locator} :text-is("${identifier}")`,
  list_item_by_partial_match: (list_item_locator, identifier) =>
    `${list_item_locator}:has-text("${identifier}")`,
};

export default class List extends CustomElement {
  constructor(context: Page, root_element: string | Locator, private readonly list_item: string) {
    super(context, root_element);
  }

  get pagination_root() {
    return this.find('[class*="paginationWrapper"]');
  }

  /**
   * Calls the callback function on each list element
   * @param {Function} cb
   */
  async for_each_list_item<T extends CustomElement>(
    cb: ForEachCallback<T>,
    item_custom_wrapper_class: ForEachItemClass<T>,
  ) {
    await this.custom_element.waitFor();

    let index = 0;
    let next_element: Locator = this.custom_element.locator(`${this.list_item}`).nth(index);

    while (await next_element.count()) {
      await next_element.scrollIntoViewIfNeeded();
      await cb(new item_custom_wrapper_class(this.context, next_element), index);

      index += 1;

      next_element = this.custom_element.locator(this.list_item).nth(index);
    }
  }

  /**
   * Gets the single list item
   * @param identifier
   * @returns
   */
  private get_list_element(identifier: string | number, exact = false) {
    if (typeof identifier === 'number') {
      return this.custom_element.locator(this.list_item).nth(identifier);
    } else {
      return this.custom_element.locator(
        exact
          ? SELECTORS.list_item_by_exact_match(this.list_item, identifier)
          : SELECTORS.list_item_by_partial_match(this.list_item, identifier),
      );
    }
  }

  /**
   * Search for element handles pagination
   * @param identifier
   * @returns
   */
  private async get_list_item(identifier: number | string, exact?: boolean): Promise<Locator> {
    await this.custom_element.waitFor({ state: 'attached' });

    const item: Locator = this.get_list_element(identifier, exact);
    let is_visible = false;
    let next_button: Button;

    if (await item.count()) {
      return item;
    }

    const first_pagination_item = new Button(
      this.context,
      this.pagination_root.locator('li[class*="paginationPage"] a').nth(0),
    );

    if (await first_pagination_item.is_visible()) {
      await first_pagination_item.click();

      next_button = new Button(
        this.context,
        this.pagination_root.locator('li[class*="next"] a[class*="paginationButtonsLinks"]'),
      );

      while (!is_visible && (await next_button.get_attribute('aria-disabled')) === 'false') {
        await next_button.click();
        await this.custom_element.waitFor();

        try {
          await item.waitFor({ timeout: 5000 });

          is_visible = true;
        } catch {
          is_visible = false;
        }
      }

      return item;
    }

    return item;
  }

  /**
   * Clicks on list item or its child
   * @param identifier list element identifier
   * @param selector "optional" selector of an element within list element which should be clicked
   */
  async click_on_list_item(
    identifier: string | number,
    { locator, exact }: { locator?: string; exact?: boolean } = {},
  ) {
    const list_item = await this.get_list_item(identifier, exact);

    await list_item.waitFor({ state: 'attached' });
    await list_item.hover();

    if (locator) {
      await list_item.locator(locator).click();
    } else {
      await list_item.click();
    }
  }

  /**
   * Gets list item text
   * @param identifier
   * @returns
   */
  async get_list_item_text(identifier: string | number) {
    return (await this.get_list_item(identifier)).innerText();
  }

  /**
   * Checks if the list item is visible
   * @param identifier
   * @returns
   */
  async is_list_item_visible(identifier: string | number): Promise<boolean> {
    this.custom_element = await this.get_list_item(identifier);

    return this.is_visible();
  }

  /**
   * Searches within particular list item
   * @param list_item_identifier
   * @param selector
   * @returns
   */
  async find_inside(list_item_identifier: string | number, child_locator?: string) {
    const list_item = await this.get_list_item(list_item_identifier);

    await list_item.waitFor();
    await list_item.hover();

    if (child_locator) {
      return list_item.locator(child_locator);
    }

    return list_item;
  }

  /**
   * Get the attribute of the list item or its inner element if `inner_selector` is passed
   * @param list_item_identifier
   * @param attribute
   * @param inner_selector
   * @returns
   */
  async get_list_item_attribute(
    list_item_identifier: string | number,
    attribute: string,
    inner_selector?: string,
  ) {
    const list_item = await this.get_list_item(list_item_identifier);

    await list_item.waitFor();

    if (inner_selector) return list_item.locator(inner_selector).getAttribute(attribute);

    return list_item.getAttribute(attribute);
  }
}

export type ForEachCallback<T> = (elem: T, index: number) => Promise<void> | void;
export type ForEachItemClass<T> = new (context: Page, custom_element: string | Locator) => T;
