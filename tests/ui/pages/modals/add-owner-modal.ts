import Button from '../../elements/button';
import InputField from '../../elements/input-field';
import TextBox from '../../elements/text-box';
import { Pages } from '../index';
import BaseModal from './base-modal';

const SELECTORS = {
  thisDialog: 'div[role="dialog"]',
  dialogTitle: 'div[role="dialog"] h2',
  ownerName: 'input[name="name"]',
  ownerNameCleanButton: 'input[name="name"] >> .. >> [type="button"]',
  addOwner: 'button:has-text("Add new owner")',
  closeDialogButton: 'div[role="dialog"] h2 >> [type="button"]',
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

  get ownerNameCleanButton() {
    return new Button(this.page, SELECTORS.ownerNameCleanButton);
  }

  get closeDialog() {
    return new Button(this.page, SELECTORS.closeDialogButton);
  }

  get dialogTitle() {
    return new TextBox(this.page, SELECTORS.dialogTitle);
  }
}
