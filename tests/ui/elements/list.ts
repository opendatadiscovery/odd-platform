import { Locator, Page } from '@playwright/test';

import CustomElement from './custom-element';

const SELECTORS = {
  listItemByExactMatch: (listItemLocator, identifier) =>
    `${listItemLocator} :text-is("${identifier}")`,
  listItemByPartialMatch: (listItemLocator, identifier) =>
    `${listItemLocator}:has-text("${identifier}")`,
};

export default class List extends CustomElement {
  constructor(context: Page, rootElement: string | Locator, private readonly listItem: string) {
    super(context, rootElement);
  }

  get paginationRoot() {
    return this.find('[class*="paginationWrapper"]');
  }

  /**
   * Gets all list items
   */
  get listItems() {
    return this.customElement.locator(this.listItem);
  }

  /**
   * Calls the callback function on each list element
   *
   * @param {Function} cb
   * @param itemCustomWrapperClass
   */
  async forEachListItem<T extends CustomElement>(
    cb: ForEachCallback<T>,
    itemCustomWrapperClass: ForEachItemClass<T>,
  ) {
    await this.customElement.waitFor();

    let index = 0;
    let nextElement: Locator = this.customElement.locator(`${this.listItem}`).nth(index);

    while (await nextElement.count()) {
      await nextElement.scrollIntoViewIfNeeded();
      await cb(new itemCustomWrapperClass(this.context, nextElement), index);

      index += 1;

      nextElement = this.customElement.locator(this.listItem).nth(index);
    }
  }

  /**
   * Gets the single list item
   *
   * @param identifier
   * @param exact
   * @returns
   */
  public getListElement(identifier: string | number, exact = false) {
    if (typeof identifier === 'number') {
      return this.customElement.locator(this.listItem).nth(identifier);
    }
    return this.customElement.locator(
      exact
        ? SELECTORS.listItemByExactMatch(this.listItem, identifier)
        : SELECTORS.listItemByPartialMatch(this.listItem, identifier),
    );
  }

  /**
   * Search for element handles pagination
   *
   * @param identifier
   * @param exact
   * @returns
   */
  private async getListItem(identifier: number | string, exact?: boolean): Promise<Locator> {
    await this.customElement.waitFor({ state: 'attached' });
    const listItem: Locator = this.getListElement(identifier, exact);
    await listItem.waitFor();
    return listItem;
  }

  /**
   * Clicks on list item or its child
   *
   * @param identifier list element identifier
   * @param selector "optional" selector of an element within list element which should be clicked
   * @param selector.locator
   * @param selector.exact
   */
  async clickOnListItem(
    identifier: string | number,
    { locator, exact }: { locator?: string; exact?: boolean } = {},
  ) {
    const listItem = await this.getListItem(identifier, exact);

    await listItem.waitFor({ state: 'attached' });
    await listItem.hover();

    if (locator) {
      await listItem.locator(locator).click();
    } else {
      await listItem.click();
    }
  }

  /**
   * Gets list item text
   *
   * @param identifier
   * @returns
   */
  async getListItemText(identifier: string | number) {
    return (await this.getListItem(identifier)).innerText();
  }

  /**
   * Checks if the list item is visible
   *
   * @param identifier
   * @returns
   */
  async isListItemVisible(identifier: string | number): Promise<boolean> {
    const listItem: Locator = await this.getListItem(identifier);
    return listItem.isVisible();
  }

  /**
   * Searches within particular list item
   *
   * @param listItemIdentifier
   * @param selector
   * @param childLocator
   * @returns
   */
  async findInside(listItemIdentifier: string | number, childLocator?: string) {
    const listItem = await this.getListItem(listItemIdentifier);

    await listItem.waitFor();
    await listItem.hover();

    if (childLocator) {
      return listItem.locator(childLocator);
    }

    return listItem;
  }

  /**
   * Get the attribute of the list item or its inner element if `innerSelector` is passed
   *
   * @param listItemIdentifier
   * @param attribute
   * @param innerSelector
   * @returns
   */
  async getListItemAttribute(
    listItemIdentifier: string | number,
    attribute: string,
    innerSelector?: string,
  ) {
    const listItem = await this.getListItem(listItemIdentifier);

    await listItem.waitFor();

    if (innerSelector) return listItem.locator(innerSelector).getAttribute(attribute);

    return listItem.getAttribute(attribute);
  }

  /**
   * Counts the number of items in the list
   */
  async count(): Promise<number> {
    await this.listItems.first().waitFor();
    return this.listItems.count();
  }

  /**
   * Check if list is empty
   */
  async isListEmpty(): Promise<boolean> {
    await this.listItems.first().waitFor({ state: 'hidden' });
    return this.listItems.isHidden();
  }
}

export type ForEachCallback<T> = (elem: T, index: number) => Promise<void> | void;
export type ForEachItemClass<T> = new (context: Page, customElement: string | Locator) => T;
