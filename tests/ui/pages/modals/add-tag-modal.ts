import InputField from "../../elements/input-field";
import Button from "../../elements/button";
import { Pages } from "../index";
import BaseModal from "./base-modal";

const SELECTORS = {
    this_dialog: 'div[role="dialog"]',
    tag_name: '[placeholder="Tag Name"]',
    add_tag: '[type="submit"]',
    important_tag: '[type="checkbox"]',
    add_one_more_tag: 'div[role="dialog"] button:has-text("Create tag")',
    tag_line_root: '.infinite-scroll-component',
}
export default class AddTagModal extends BaseModal {
    constructor(pages: Pages) {
        super(pages, SELECTORS.this_dialog);
    }
    get tag_name_field() {
        return new InputField(this.page, SELECTORS.tag_name);
    }
    get add_new_tag() {
        return new Button(this.page, SELECTORS.add_tag);
    }
    async check_important(indexOfCheckbox: number) {
        await this.page.locator(SELECTORS.important_tag).nth(indexOfCheckbox).click();
    }
    get add_one_more_tag() {
        return new Button(this.page, SELECTORS.add_one_more_tag);
    }
    async fill_all_tag_name(name:string) {
        const new_tags = [];
        const input_count = await this.page.locator(SELECTORS.tag_name).count();
        for (let i=0; i < input_count; i++) {
            await this.page.locator(SELECTORS.tag_name).nth(i).fill(`${name}_${i}`);
            new_tags.push(`${name}_${i}`);
        }
        return new_tags;
    }
}