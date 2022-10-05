import BasePage from "../base-page";
import Button from "../../elements/button";

const CONSTANTS_DATASOURSE = {
    all:'All',
    bookShop: 'BookShop ETL',
    kinesis: 'Kinesis Data Stream consumer'
}
const CONSTANTS_NAMESPACE = {}
const CONSTANTS_TYPE = {}
const CONSTANTS_OWNER = {}
const CONSTANTS_TAG = {}
const SELECTORS = {
    clearAll: `button:has-text('Clear All')`,
    filterWithSelect: filterName => `.MuiGrid-root.css-19dbjmo:has-text('${filterName}')`,
    filterWithInput: filterName => `.MuiAutocomplete-root.MuiAutocomplete-fullWidth:has-text('${filterName}')`,
    filterSelect: `[role="button"]`,
    filterInput: `[placeholder="Search by name"]`,
    searchBar: `[placeholder="Search"]`,
    searchButton: `.sc-kDDrLX.gpLWbw > div > div > div > div > [type="button"]`,
    listOfFilters: `[role="listbox"]`,
    filterOption: option => `[role="menuitem"]:has-text('${option}')`
}
export default class CatalogPage extends BasePage {
    get clearAll() {
        return new Button(this.page, SELECTORS.clearAll);
    }
    async openFilterWithSelect(nameOfFilter: string) {
       await this.page.click(`${SELECTORS.filterWithSelect(nameOfFilter)} >> ${SELECTORS.filterSelect}`);
    }
    async chooseOption(optionOfFilter: string) {
        await this.page.click(`${SELECTORS.listOfFilters} > ${SELECTORS.filterOption(optionOfFilter)}`)
    }
    async openFilterWithInput(nameOfFilter: string) {
        await this.page.click(`${SELECTORS.filterWithInput(nameOfFilter)} >> ${SELECTORS.filterSelect}`);
    }
}
