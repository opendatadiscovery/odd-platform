import InputField from '../../elements/input-field';
import List from '../../elements/list';
import BasePage from '../base-page';

const SELECTORS = {
  searchBar: `[data-qa="search_string"]`,
  searchDropdown: `[data-qa="search_dropdown"]`,
  dropdownString: `li`,
};
export default class MainPage extends BasePage {
  get searchBar() {
    return new InputField(this.page, SELECTORS.searchBar);
  }

  get resultList() {
    return new List(this.page, SELECTORS.searchDropdown, SELECTORS.dropdownString);
  }

  async search(text: string) {
    await this.searchBar.type(text);
    await this.locator(SELECTORS.searchDropdown).isVisible();
  }

  async isListItemVisible(name: string): Promise<boolean> {
    return this.resultList.isListItemVisible(name);
  }
}
