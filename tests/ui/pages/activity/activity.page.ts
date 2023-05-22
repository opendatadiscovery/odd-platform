import Button from '../../elements/button';
import Dropdown from '../../elements/dropdown';
import List from '../../elements/list';
import TextBox from '../../elements/text-box';
import BasePage from '../base-page';

const SELECTORS = {
  datasourceFilter: '[data-qa="datasource_filter"] >> ..',
  namespaceFilter: '[data-qa="namespace_filter"] >> ..',
  eventTypeSelect: '[data-qa="event_type_filter"] >> ..',
  tagFilter: `[data-qa="tag_filter"] input`,
  ownerFilter: `[data-qa="owner_filter"] input`,
  resultList: `[data-qa="activity_results_list"]`,
  resultItem: `[data-qa="activity_list_item"]`,
  filterWithInputOption: `[role="presentation"]`,
  filterDropdown: '[role="listbox"]',
  filterOption: '[role="option"]',
  calendar3dayButton: `[type="button"]:has-text('3 Day')`,
  calendarDoneButton: `[type="button"]:has-text('Done')`,
  calendar: `.rmdp-container`,
  noContent: `text=No information to display`,
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

  get alertNoContent() {
    return new TextBox(this.page, SELECTORS.noContent);
  }

  get tagFilter() {
    return new Dropdown(
      this.page,
      SELECTORS.tagFilter,
      SELECTORS.filterDropdown,
      SELECTORS.filterOption,
    );
  }

  get ownerFilter() {
    return new Dropdown(
      this.page,
      SELECTORS.ownerFilter,
      SELECTORS.filterDropdown,
      SELECTORS.filterOption,
    );
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

  async openFilterWithDate() {
    await this.page.locator(SELECTORS.calendar).click();
  }

  async choose3days(name: string) {
    await this.openFilterWithDate();
    await this.day3Button.click();
    await this.doneButton.click();
  }

  async countListItems(name: string): Promise<number> {
    return this.resultsList.count();
  }

  async isAlertVisible(): Promise<boolean> {
    return this.alertNoContent.isVisible();
  }
}
