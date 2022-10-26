import InputField from '../../elements/input-field';
import BasePage from '../base-page';

const SELECTORS = {
  filterWithSelect: filterName => `.MuiGrid-root.css-19dbjmo:has-text('${filterName}')`,
  filterWithInput: filterName =>
    `.MuiGrid-root.MuiGrid-item.MuiGrid-grid-xs-12.css-1vkoyw5:has-text('${filterName}')`,
  filterInput: `[type="text"]`,
  searchBar: `[placeholder="Search"]`,
  searchButton: `.sc-kDDrLX.gpLWbw button[type="button"]`,
  listOfFilters: `[role="listbox"]`,
  filterOption: `[role="option"]`,
  listItemName: name => `a:has-text('${name}')`,
  tab: name => `[role="tab"]:has-text('${name}')`,
};
export default class CatalogPage extends BasePage {
  async openFilterWithSelect(filterName: string) {
    await this.page.click(`${SELECTORS.filterWithSelect(filterName)}`);
  }

  async chooseOption(option: string) {
    await this.page.click(
      `${SELECTORS.listOfFilters} >> ${SELECTORS.filterOption}:has-text('${option}')`,
    );
  }

  async searchByTextInFilter(filter: string, text: string) {
    await this.page.waitForLoadState('networkidle');
    await this.page
      .locator(`${SELECTORS.filterWithInput(filter)} >> ${SELECTORS.filterInput}`)
      .fill(text);
    await this.page.locator(SELECTORS.filterWithInput(filter)).press('Enter');
  }

  async openFilterWithInput(nameOfFilter: string) {
    await this.page.click(`${SELECTORS.filterWithInput(nameOfFilter)} >> ${SELECTORS.filterInput}`);
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
