import { Locator, Page } from '@playwright/test';

import Button from './button';
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
  private getListElement(identifier: string | number, exact = false) {
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

    const item: Locator = this.getListElement(identifier, exact);
    let isVisible = false;
    let nextButton: Button;

    if (await item.count()) {
      return item;
    }

    const firstPaginationItem = new Button(
      this.context,
      this.paginationRoot.locator('li[class*="paginationPage"] a').nth(0),
    );

    if (await firstPaginationItem.isVisible()) {
      await firstPaginationItem.click();

      nextButton = new Button(
        this.context,
        this.paginationRoot.locator('li[class*="next"] a[class*="paginationButtonsLinks"]'),
      );

      while (!isVisible && (await nextButton.getAttribute('aria-disabled')) === 'false') {
        await nextButton.click();
        await this.customElement.waitFor();

        try {
          await item.waitFor({ timeout: 5000 });

          isVisible = true;
        } catch {
          isVisible = false;
        }
      }

      return item;
    }

    return item;
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
    this.customElement = await this.getListItem(identifier);

    return this.isVisible();
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
}

export type ForEachCallback<T> = (elem: T, index: number) => Promise<void> | void;
export type ForEachItemClass<T> = new (context: Page, customElement: string | Locator) => T;
