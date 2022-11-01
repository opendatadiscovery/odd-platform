import InputField from '../../elements/input-field';
import BasePage from '../base-page';

const SELECTORS = {
  filterWithSelect: filterName => `#select-label-id:has-text('${filterName}') >> ..`,
  filterWithInput: filterName => `label:text-is("${filterName}") >> ..`,
  searchBar: `[placeholder="Search"]`,
  listOfFilters: `[role="listbox"]`,
  filterOption: `[role="option"]`,
  filterWithInputOption: `[role="presentation"]`,
  listItemName: name => `a:has-text('${name}')`,
  tab: name => `[role="tab"]:has-text('${name}')`,
};
export default class CatalogPage extends BasePage {
  async openFilterWithSelect(filterName: string) {
    await this.page.locator(SELECTORS.filterWithSelect(filterName)).click();
  }

  async chooseOption(option: string) {
    await this.page.click(
      `${SELECTORS.listOfFilters} >> ${SELECTORS.filterOption}:has-text('${option}')`,
    );
  }

  async searchByTextInFilter(filter: string, text: string) {
    await this.page.locator(`${SELECTORS.filterWithInput(filter)} >> input`).fill(text);
    await this.page.locator(`${SELECTORS.filterWithInputOption}:has-text('${text}')`).click();
  }

  async openFilterWithInput(nameOfFilter: string) {
    await this.page.locator(SELECTORS.filterWithInput(nameOfFilter)).click();
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

  async searchByText(text: string) {
    await this.searchBar.fill(text);
    await this.page.locator(SELECTORS.searchBar).press('Enter');
  }
}
