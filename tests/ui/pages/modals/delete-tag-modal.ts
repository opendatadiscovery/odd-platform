import Button from "../../elements/button";
import { Pages } from "../index";
import BaseModal from "./base-modal";

const SELECTORS = {
    this_dialog: 'div[role="dialog"]',
    delete_tag: 'button:has-text:"Delete"',
    delete_tag_confirm: 'text=Delete Tag',
}
export default class DeleteTagModal extends BaseModal {
    constructor(pages: Pages) {
        super(pages, SELECTORS.this_dialog);
    }
    get delete_tag_confirm() {
        return new Button(this.page, SELECTORS.delete_tag_confirm);
    }
}