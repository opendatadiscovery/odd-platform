import Button from '../../elements/button';
import InputField from '../../elements/input-field';
import List from '../../elements/list';
import TextBox from '../../elements/text-box';
import BasePage from '../base-page';

const SELECTORS = {
  filterWithSelect: filterName => `#select-label-id:has-text('${filterName}') >> ..`,
  filterWithInput: filterName => `label:text-is("${filterName}") >> ..`,
  searchBar: `[placeholder="Search"]`,
  cleanSearchBarButton: `[placeholder="Search"] >> .. >> [title="Clear"]`,
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
  get searchBar() {
    return new InputField(this.page, SELECTORS.searchBar);
  }

  get alertNoMatchesFound() {
    return new TextBox(this.page, SELECTORS.noMatchesFound);
  }

  get resultsList() {
    return new List(this.page, SELECTORS.resultList, SELECTORS.listItem);
  }

  get cleanSearchBar() {
    return new Button(this.page, SELECTORS.cleanSearchBarButton);
  }

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

  async searchBy(text: string) {
    await this.searchBar.fill(text);
    await this.page.locator(SELECTORS.searchBar).press('Enter');
  }

  async isAlertVisible(): Promise<boolean> {
    return this.alertNoMatchesFound.isVisible();
  }

  async isAlertHidden(): Promise<boolean> {
    return this.alertNoMatchesFound.isHidden();
  }

  async countListItems(): Promise<number> {
    return this.resultsList.count();
  }
}
