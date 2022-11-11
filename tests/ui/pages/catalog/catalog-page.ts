import InputField from '../../elements/input-field';
import BasePage from '../base-page';

const SELECTORS = {
  filterWithSelect: filterName => `#select-label-id:has-text('${filterName}') >> ..`,
  filterWithInput: filterName => `label:text-is("${filterName}") >> ..`,
  searchBar: `[placeholder="Search"]`,
  filterList: `[role="listbox"]`,
  filterOption: `[role="option"]`,
  filterWithInputOption: `[role="presentation"]`,
  listItemName: name => `a:has-text('${name}')`,
  tab: name => `[role="tab"]:has-text('${name}')`,
  searchButton: `[placeholder="Search"] >> ..`,
  noMatchesFound: `text=No matches found`,
  resultList: `#results-list`,
  listItem: `a`,
};
export default class CatalogPage extends BasePage {
  async openFilterWithSelect(filterName: string) {
    await this.page.locator(SELECTORS.filterWithSelect(filterName)).click();
  }

  async chooseOption(option: string) {
    await this.page.click(
      `${SELECTORS.filterList} >> ${SELECTORS.filterOption}:has-text('${option}')`,
    );
  }

  async searchByTextInFilter(filter: string, text: string) {
    await this.page.locator(`${SELECTORS.filterWithInput(filter)} >> input`).fill(text);
    await this.page.locator(`${SELECTORS.filterWithInputOption}:has-text('${text}')`).click();
  }

  async openFilterWithInput(filterName: string) {
    await this.page.locator(SELECTORS.filterWithInput(filterName)).click();
  }

  async isListItemVisible(name: string): Promise<boolean> {
    await this.page.locator(SELECTORS.listItemName(name)).waitFor({ state: 'visible' });
    return this.page.locator(SELECTORS.listItemName(name)).isVisible();
  }

  async clickOnListItem(name: string) {
    await this.page.locator(SELECTORS.listItemName(name)).click();
  }

  async clickTab(name: string) {
    return this.page.locator(SELECTORS.tab(name)).click();
  }

  get searchBar() {
    return new InputField(this.page, SELECTORS.searchBar);
  }

  async searchBy(text: string) {
    await this.searchBar.fill(text);
    await this.page.locator(SELECTORS.searchBar).press('Enter');
  }

  async isAlertVisible(): Promise<boolean> {
    await this.page.locator(SELECTORS.noMatchesFound).waitFor({ state: 'visible' });
    return this.page.locator(SELECTORS.noMatchesFound).isVisible();
  }

  async isAlertHidden(): Promise<boolean> {
    await this.page.locator(SELECTORS.noMatchesFound).waitFor({ state: 'hidden' });
    return this.page.locator(SELECTORS.noMatchesFound).isHidden();
  }

  get resultsList() {
    return this.page.locator(SELECTORS.resultList);
  }

  async isListVisible(): Promise<boolean> {
    return this.resultsList.locator(SELECTORS.listItem).isVisible();
  }

  async countListItems() {
    const listItems = this.resultsList.locator(SELECTORS.listItem);
    await listItems.first().waitFor();
    return listItems.count();
  }
}
