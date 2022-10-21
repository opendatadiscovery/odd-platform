import Button from '../../elements/button';
import BasePage from '../base-page';

const SELECTORS = {
  clearAll: `button:has-text('Clear All')`,
  filterWithSelect: filterName => `.MuiGrid-root.css-19dbjmo:has-text('${filterName}')`,
  filterWithInput: filterName =>
    `.MuiGrid-root.MuiGrid-item.MuiGrid-grid-xs-12.css-1vkoyw5:has-text('${filterName}')`,
  filterSelect: `[role="button"]`,
  filterInput: `[type="text"]`,
  searchBar: `[placeholder="Search"]`,
  searchButton: `.sc-kDDrLX.gpLWbw > div > div > div > div > [type="button"]`,
  listOfFilters: `[role="listbox"]`,
    filterOption: `[role="option"]`,
  itemString: name => `a:has-text('${name}')`,
  tab: name => `[role="tab"]:has-text('${name}')`,
    optionJobInTypeFilter: `[aria-activedescendant="filter-types-option-1]`,
};
export default class CatalogPage extends BasePage {
  get clearAll() {
    return new Button(this.page, SELECTORS.clearAll);
  }

  async openFilterWithSelect(nameOfFilter: string) {
      await this.page.waitForLoadState("networkidle");
    await this.page.click(
      `${SELECTORS.filterWithSelect(nameOfFilter)}`);
  }

  async chooseOption(optionOfFilter: string) {
    await this.page.click(`${SELECTORS.listOfFilters} >> ${SELECTORS.filterOption}:has-text('${optionOfFilter}')`);
  }
    async chooseOptionJobInTypeFilter() {
        await this.page.click(`${SELECTORS.listOfFilters} >> ${SELECTORS.optionJobInTypeFilter}`);
    }

  async openFilterWithInput(nameOfFilter: string) {
    await this.page.click(`${SELECTORS.filterWithInput(nameOfFilter)} >> ${SELECTORS.filterInput}`);
  }

  async isVisible(name: string): Promise <boolean> {
      await this.page.locator(SELECTORS.itemString(name)).waitFor({state:"visible"});
      return this.page.locator(SELECTORS.itemString(name)).isVisible();
  }

  async openDataEntity(name: string) {
    await this.page.locator(SELECTORS.itemString(name)).click();
  }

  async clickTab(name:string) {
    return this.page.locator(SELECTORS.tab(name)).click();
  }

  async fillSearchString(text: string) {
      await this.page.locator(SELECTORS.searchBar).fill(text);
      await this.page.locator(SELECTORS.searchBar).press('Enter')
  }
}
