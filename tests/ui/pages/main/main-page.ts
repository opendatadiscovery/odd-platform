import InputField from '../../elements/input-field';
import List from '../../elements/list';
import BasePage from '../base-page';

const SELECTORS = {
  searchBar: `[placeholder="Search data tables, feature groups, jobs and ML models via keywords"]`,
  searchDropdown: `[data-popper-placement="bottom"]`,
  dropdownString: `li`,
};
export default class MainPage extends BasePage {
  get searchBar() {
    return new InputField(this.page, SELECTORS.searchBar);
  }

  async search(text: string) {
    await this.searchBar.type(text);
    await this.locator(SELECTORS.searchDropdown).isVisible();
  }

  get resultList() {
    return new List(this.page, SELECTORS.searchDropdown, SELECTORS.dropdownString);
  }

  async isListItemVisible(name: string): Promise<boolean> {
    return this.resultList.isListItemVisible(name);
  }
}
