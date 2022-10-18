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
  listOfFilters: `[role="presentation"]`,
  itemString: name => `p:has-text('${name}')`,
  tabAll: `[role="tab"]:has-text('All')`,
  amountInTab: amount => `.sc-idiyUo.dZSeSb:has-text('${amount}')`,
};
export default class CatalogPage extends BasePage {
  get clearAll() {
    return new Button(this.page, SELECTORS.clearAll);
  }

  async openFilterWithSelect(nameOfFilter: string) {
    await this.page.click(
      `${SELECTORS.filterWithSelect(nameOfFilter)} >> ${SELECTORS.filterSelect}`,
    );
  }

  async chooseOption(optionOfFilter: string) {
    await this.page.click(`${SELECTORS.listOfFilters}:has-text('${optionOfFilter}')`);
  }

  async openFilterWithInput(nameOfFilter: string) {
    await this.page.click(`${SELECTORS.filterWithInput(nameOfFilter)} >> ${SELECTORS.filterInput}`);
  }

  async isVisible(name: string) {
    await this.page.locator(SELECTORS.itemString(name)).isVisible();
  }

  async openDataEntity(name: string) {
    await this.page.locator(SELECTORS.itemString(name)).click();
  }

  async checkAmountDataEntityTabAll(amount: string) {
    return this.page.locator(`${SELECTORS.tabAll} >> ${SELECTORS.amountInTab(amount)}`).isVisible();
  }
}
