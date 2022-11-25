import BasePage from '../base-page';
import InputField from "../../elements/input-field";

const SELECTORS = {
    searchBar: `.MuiBox-root.css-18l5dsu div input`,
    searchDropdown: `[data-popper-placement="bottom"]`,
    dropdownString: name =>`[role="presentation"]:has-text('${name}')`


};
export default class MainPage extends BasePage {
    get searchBar() {
        return new InputField(this.page, SELECTORS.searchBar)
    }

    async search(text: string) {
        await this.searchBar.type(text)
        await this.locator(SELECTORS.searchDropdown).isVisible();
    }

    async isListItemVisible(name: string): Promise<boolean> {
        await this.page.locator(SELECTORS.dropdownString(name)).waitFor({ state: 'visible' });
        return this.page.locator(SELECTORS.dropdownString(name)).isVisible();
    }
}