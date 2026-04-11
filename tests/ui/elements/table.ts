import { Locator, Page } from '@playwright/test';

import CustomElement from './custom-element';
import Dropdown from './dropdown';
import List, { ForEachCallback, ForEachItemClass } from './list';

const SELECTORS = {
  headerRoot: 'thead',
  bodyRoot: 'tbody',
  row: 'tr',
  headerCell: 'th',
  bodyCell: 'td',
  paginationContainer: 'ul[class*="paginationContainer"]',
  paginationNextButton: 'li[class*="next"] a[class*="paginationButtonsLinks"]',
  paginationItems: 'a[class*="paginatonLink"]',
  pageSize: 'div[class*="documentsPageSize"]',
  pageSizeOption: (optionIndex: number): string =>
    `div[id^="react-select"][id$="-option-${optionIndex}"]`,
};

export default class Table extends CustomElement {
  private readonly selectors: typeof SELECTORS;

  private readonly list: List;

  constructor(
    context: Page,
    rootElement: string | Locator,
    tableSelectors?: {
      headerRoot: string;
      bodyRoot: string;
      row: string;
      headerCell: string;
      bodyCell: string;
    },
  ) {
    super(context, rootElement);

    this.selectors = { ...SELECTORS, ...tableSelectors };
    this.list = new List(this.context, this.getBody(), this.selectors.row);
  }

  get exists() {
    return this.customElement.isVisible();
  }

  /**
   *
   * @param selector
   */
  find(selector: string) {
    return this.customElement.locator(selector);
  }

  /**
   *
   */
  private getHeader() {
    return this.customElement.locator(this.selectors.headerRoot);
  }

  /**
   *
   */
  private getHeaderCells() {
    return this.getHeader().locator(this.selectors.headerCell);
  }

  /**
   *
   */
  private getBody() {
    return this.customElement.locator(this.selectors.bodyRoot);
  }

  /**
   *
   * @param cellIdentifier ordering index or text content
   * @returns Locator
   */
  getHeaderCell(cellIdentifier: number | string): Locator {
    let headerCell: Locator;

    if (typeof cellIdentifier === 'number') {
      headerCell = this.getHeader().locator(this.selectors.headerCell).nth(cellIdentifier);
    } else {
      headerCell = this.getHeader().locator(`text=${cellIdentifier}`);
    }

    return headerCell;
  }

  /**
   * Click on header checkbox to select all items
   *
   * @param cellIndex
   * @param checkboxLocator
   */
  async clickHeaderCell(cellIndex: number, checkboxLocator: string) {
    const row = this.getHeaderCell(cellIndex);

    await row.locator(checkboxLocator).click();
  }

  /**
   *
   */
  getRows(): Locator {
    return this.getBody().locator(this.selectors.row);
  }

  /**
   *
   * @param rowIdentifier
   */
  private getRowByIdentifier(rowIdentifier: number | string): Locator {
    if (typeof rowIdentifier === 'number') {
      return this.getRows().nth(rowIdentifier);
    }
    return this.getBody().locator(`${this.selectors.row}:has-text("${rowIdentifier}")`);
  }

  /**
   *
   */
  getRowsCount(): Promise<number> {
    return this.getRows().count();
  }

  /**
   *
   * @param rowIndex
   * @param cellIndex
   */
  async getRowCell(rowIndex: number, cellIndex: number) {
    const row = await this.getRow(rowIndex);

    return row.locator(this.selectors.bodyCell).nth(cellIndex);
  }

  /**
   *
   */
  private getPaginationRoot() {
    return this.context.locator(this.selectors.paginationContainer);
  }

  /**
   *
   */
  private getPageSize() {
    return new Dropdown(this.context, this.selectors.pageSize);
  }

  /**
   *
   * @param rowIdentifier
   */
  async getRow(rowIdentifier: number | string): Promise<Locator> {
    await this.getBody().waitFor();

    const row: Locator = this.getRowByIdentifier(rowIdentifier);
    let rowCount: number;
    let nextButton: Locator;

    if (await row.count()) {
      return row;
    }

    const firstPaginationItem = this.getPaginationRoot()
      .locator(this.selectors.paginationItems)
      .nth(0);
    const pageSize = this.context.locator(this.selectors.pageSize);

    if (await pageSize.isVisible()) {
      await this.getPageSize().set('50');
      await this.getBody().waitFor();
    }

    if (await row.count()) {
      return row;
    }

    if (await firstPaginationItem.count()) {
      await firstPaginationItem.click();

      nextButton = this.getPaginationRoot().locator(this.selectors.paginationNextButton);

      while (!rowCount && (await nextButton.getAttribute('aria-disabled')) === 'false') {
        await nextButton.click();
        await this.getBody().waitFor();

        rowCount = await row.count();
      }

      return row;
    }

    return row;
  }

  /**
   *
   * @param rowIdentifier
   */
  async isRowVisible(rowIdentifier: number | string) {
    this.customElement = await this.getRow(rowIdentifier);

    return this.isVisible();
  }

  /**
   *
   * @param rowIdentifier
   */
  async isRowHidden(rowIdentifier: number | string) {
    this.customElement = await this.getRow(rowIdentifier);

    return this.customElement.isHidden();
  }

  /**
   *
   * @param rowIdentifier
   * @param childSelector
   */
  async clickRow(rowIdentifier: number | string, childSelector = 'a') {
    const row = await this.getRow(rowIdentifier);

    await row.hover();

    this.customElement = row.locator(childSelector);

    await this.customElement.click();
  }

  /**
   *
   * @param callback
   * @param itemCustomWrapperClass
   */
  async forEachRow<T extends CustomElement>(
    callback: ForEachCallback<T>,
    itemCustomWrapperClass: ForEachItemClass<T>,
  ) {
    await this.list.forEachListItem(callback, itemCustomWrapperClass);
  }

  /**
   *
   * @param callback
   * @param itemCustomWrapperClass
   */
  async forEachHeaderCell<T extends CustomElement>(
    callback: ForEachCallback<T>,
    itemCustomWrapperClass: ForEachItemClass<T>,
  ) {
    await this.getHeader().waitFor();

    const count = await this.getHeaderCells().count();

    for (let i = 0; i < count; i++) {
      await callback(new itemCustomWrapperClass(this.context, this.getHeaderCell(i)), i);
    }
  }
}
