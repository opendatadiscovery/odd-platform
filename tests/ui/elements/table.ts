import { Locator, Page } from '@playwright/test';

import CustomElement from './custom-element';
import Dropdown from './dropdown';
import List, { ForEachCallback, ForEachItemClass } from './list';

const SELECTORS = {
  header_root: 'thead',
  body_root: 'tbody',
  row: 'tr',
  header_cell: 'th',
  body_cell: 'td',
  pagination_container: 'ul[class*="paginationContainer"]',
  pagination_next_button: 'li[class*="next"] a[class*="paginationButtonsLinks"]',
  pagination_items: 'a[class*="paginatonLink"]',
  page_size: 'div[class*="documentsPageSize"]',
  page_size_option: (option_index: number): string =>
    `div[id^="react-select"][id$="-option-${option_index}"]`,
};

export default class Table extends CustomElement {
  private readonly selectors: typeof SELECTORS;
  private readonly list: List;

  constructor(
    context: Page,
    root_element: string | Locator,
    table_selectors?: {
      header_root: string;
      body_root: string;
      row: string;
      header_cell: string;
      body_cell: string;
    },
  ) {
    super(context, root_element);

    this.selectors = { ...SELECTORS, ...table_selectors };
    this.list = new List(this.context, this.get_body(), this.selectors.row);
  }

  get exists() {
    return this.custom_element.isVisible();
  }

  /**
   *
   */
  find(selector: string) {
    return this.custom_element.locator(selector);
  }

  /**
   *
   */
  private get_header() {
    return this.custom_element.locator(this.selectors.header_root);
  }

  /**
   *
   */
  private get_header_cells() {
    return this.get_header().locator(this.selectors.header_cell);
  }

  /**
   *
   */
  private get_body() {
    return this.custom_element.locator(this.selectors.body_root);
  }

  /**
   *
   * @param cell_identifier ordering index or text content
   * @returns Locator
   */
  get_header_cell(cell_identifier: number | string): Locator {
    let header_cell: Locator;

    if (typeof cell_identifier === 'number') {
      header_cell = this.get_header().locator(this.selectors.header_cell).nth(cell_identifier);
    } else {
      header_cell = this.get_header().locator(`text=${cell_identifier}`);
    }

    return header_cell;
  }

  /**
   * Click on header checkbox to select all items
   */
  async click_header_cell(cell_index: number, checkbox_locator: string) {
    const row = this.get_header_cell(cell_index);

    await row.locator(checkbox_locator).click();
  }

  /**
   *
   */
  get_rows(): Locator {
    return this.get_body().locator(this.selectors.row);
  }

  /**
   *
   */
  private get_row_by_identifier(row_identifier: number | string): Locator {
    if (typeof row_identifier === 'number') {
      return this.get_rows().nth(row_identifier);
    } else {
      return this.get_body().locator(`${this.selectors.row}:has-text("${row_identifier}")`);
    }
  }

  /**
   *
   */
  get_rows_count(): Promise<number> {
    return this.get_rows().count();
  }

  /**
   *
   */
  async get_row_cell(row_index: number, cell_index: number) {
    const row = await this.get_row(row_index);

    return row.locator(this.selectors.body_cell).nth(cell_index);
  }

  /**
   *
   */
  private get_pagination_root() {
    return this.context.locator(this.selectors.pagination_container);
  }

  /**
   *
   */
  private get_page_size() {
    return new Dropdown(this.context, this.selectors.page_size);
  }

  /**
   *
   */
  async get_row(row_identifier: number | string): Promise<Locator> {
    await this.get_body().waitFor();

    const row: Locator = this.get_row_by_identifier(row_identifier);
    let row_count: number;
    let next_button: Locator;

    if (await row.count()) {
      return row;
    }

    const first_pagination_item = this.get_pagination_root()
      .locator(this.selectors.pagination_items)
      .nth(0);
    const page_size = this.context.locator(this.selectors.page_size);

    if (await page_size.isVisible()) {
      await this.get_page_size().set('50');
      await this.get_body().waitFor();
    }

    if (await row.count()) {
      return row;
    }

    if (await first_pagination_item.count()) {
      await first_pagination_item.click();

      next_button = this.get_pagination_root().locator(this.selectors.pagination_next_button);

      while (!row_count && (await next_button.getAttribute('aria-disabled')) === 'false') {
        await next_button.click();
        await this.get_body().waitFor();

        row_count = await row.count();
      }

      return row;
    }

    return row;
  }

  /**
   *
   */
  async is_row_visible(row_identifier: number | string) {
    this.custom_element = await this.get_row(row_identifier);

    return this.is_visible();
  }

  /**
   *
   */
  async is_row_hidden(row_identifier: number | string) {
    this.custom_element = await this.get_row(row_identifier);

    return this.custom_element.isHidden();
  }

  /**
   *
   */
  async click_row(row_identifier: number | string, child_selector = 'a') {
    const row = await this.get_row(row_identifier);

    await row.hover();

    this.custom_element = row.locator(child_selector);

    await this.custom_element.click();
  }

  /**
   *
   */
  async for_each_row<T extends CustomElement>(
    callback: ForEachCallback<T>,
    item_custom_wrapper_class: ForEachItemClass<T>,
  ) {
    await this.list.for_each_list_item(callback, item_custom_wrapper_class);
  }

  /**
   *
   */
  async for_each_header_cell<T extends CustomElement>(
    callback: ForEachCallback<T>,
    item_custom_wrapper_class: ForEachItemClass<T>,
  ) {
    await this.get_header().waitFor();

    const count = await this.get_header_cells().count();

    for (let i = 0; i < count; i++) {
      await callback(new item_custom_wrapper_class(this.context, this.get_header_cell(i)), i);
    }
  }
}
