import Button from '../../elements/button';
import InputField from '../../elements/input-field';
import { Pages } from '../index';
import BaseModal from './base-modal';

const SELECTORS = {
  thisDialog: 'div[role="dialog"]',
  ownerName: 'input[name="name"]',
  addOwner: 'button:has-text("Add new owner")',
};

export default class AddOwnerModal extends BaseModal {
  constructor(pages: Pages) {
    super(pages, SELECTORS.thisDialog);
  }

  /**
   * Returns the `InputField` custom wrapper for `Owner name` field
   */
  get ownerNameField() {
    return new InputField(this.page, SELECTORS.ownerName);
  }

  /**
   * Returns the `Button` custom wrapper for `Results` list
   */
  get addNewOwner() {
    return new Button(this.page, SELECTORS.addOwner);
  }
}
