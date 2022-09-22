import InputField from "../../elements/input-field";
import Checkbox from "../../elements/checkbox";
import Button from "../../elements/button";
import { Pages } from "../index";
import BaseModal from "./base-modal";

const SELECTORS = {
    this_dialog: 'div[role="dialog"]',
    tag_name: '[placeholder="Tag Name"]',
    save_tag: '[type="submit"]',
    important_tag: '[type="checkbox"]',
}
export default class EditTagModal extends BaseModal {
    constructor(pages: Pages) {
        super(pages, SELECTORS.this_dialog);
    }
    get tag_name_field() {
        return new InputField(this.page, SELECTORS.tag_name);
    }
    get check_important() {
        return new Checkbox(this.page, SELECTORS.important_tag);
    }
    get save_tag() {
        return new Button(this.page, SELECTORS.save_tag);
    }
}