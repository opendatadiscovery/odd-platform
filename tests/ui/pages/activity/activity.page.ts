import Button from '../../elements/button';
import List from '../../elements/list';
import BasePage from '../base-page';

const SELECTORS = {
  datasourceFilter: '[data-qa="datasource_filter"] >> ..',
  namespaceFilter: '[data-qa="namespace_filter"] >> ..',
  eventTypeSelect: '[data-qa="event_type_filter"] >> ..',
  filterWithInput: filterName => `label:has-text("${filterName}") >> ..`,
  resultList: `[data-qa="activity_results_list"]`,
  resultItem: `[data-qa="activity_list_item"]`,
  filterWithInputOption: `[role="presentation"]`,
  filterDropdown: '[role="listbox"]',
  filterOption: '[role="option"]',
  calendar3dayButton: `[type="button"]:has-text('3 Day')`,
  calendarDoneButton: `[type="button"]:has-text('Done')`,
  calendar: `.rmdp-container`,
};
export default class ActivityPage extends BasePage {
  get datasourceSelect() {
    return new Button(this.page, SELECTORS.datasourceFilter);
  }

  get namespaceSelect() {
    return new Button(this.page, SELECTORS.namespaceFilter);
  }

  get eventTypeSelect() {
    return new Button(this.page, SELECTORS.eventTypeSelect);
  }

  get day3Button() {
    return new Button(this.page, SELECTORS.calendar3dayButton);
  }

  get doneButton() {
    return new Button(this.page, SELECTORS.calendarDoneButton);
  }

  get resultsList() {
    return new List(this.page, SELECTORS.resultList, SELECTORS.resultItem);
  }

  async openFilterWithSelect(filterName: string) {
    if (filterName === 'Datasource') {
      await this.datasourceSelect.click();
    } else if (filterName === 'Namespace') {
      await this.namespaceSelect.click();
    } else {
      await this.eventTypeSelect.click();
    }
  }

  async chooseOption(option: string) {
    await this.page.click(
      `${SELECTORS.filterDropdown} >> ${SELECTORS.filterOption}:has-text('${option}')`,
    );
  }

  async isListItemVisible(name: string): Promise<boolean> {
    await this.page
      .locator(`${SELECTORS.resultItem}:has-text('${name}')`)
      .waitFor({ state: 'visible' });
    return this.page.locator(`${SELECTORS.resultItem}:has-text('${name}')`).isVisible();
  }

  async searchByTextInFilter(filter: string, text: string) {
    await this.page.locator(`${SELECTORS.filterWithInput(filter)} >> input`).fill(text);
    await this.page.locator(`${SELECTORS.filterWithInputOption}:has-text('${text}')`).click();
  }

  async openFilterWithDate(name: string) {
    await this.page.locator(SELECTORS.calendar).click();
  }

  async choose3days(name: string) {
    await this.openFilterWithDate(name);
    await this.day3Button.click();
    await this.doneButton.click();
  }

  async countListItems(name: string): Promise<number> {
    await this.page.locator(`${SELECTORS.resultItem}:has-text('${name}')`).allTextContents();

    return this.resultsList.count();
  }
}
