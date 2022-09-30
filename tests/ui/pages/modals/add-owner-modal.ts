import Button from '../../elements/button';
import InputField from '../../elements/input-field';
import { Pages } from '../index';
import BaseModal from './base-modal';

const SELECTORS = {
  this_dialog: 'div[role="dialog"]',
  owner_name: 'input[name="name"]',
  add_owner: 'button:has-text("Add new owner")',
};

export default class AddOwnerModal extends BaseModal {
  constructor(pages: Pages) {
    super(pages, SELECTORS.this_dialog);
  }

  /**
   * Returns the `InputField` custom wrapper for `Owner name` field
   */
  get owner_name_field() {
    return new InputField(this.page, SELECTORS.owner_name);
  }

  /**
   * Returns the `Button` custom wrapper for `Results` list
   */
  get add_new_owner() {
    return new Button(this.page, SELECTORS.add_owner);
  }
}
