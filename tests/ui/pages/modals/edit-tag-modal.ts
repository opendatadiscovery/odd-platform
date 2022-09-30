import Button from '../../elements/button';
import Checkbox from '../../elements/checkbox';
import InputField from '../../elements/input-field';
import { Pages } from '../index';
import BaseModal from './base-modal';

const SELECTORS = {
  thisDialog: 'div[role="dialog"]',
  tagName: '[placeholder="Tag Name"]',
  saveTag: '[type="submit"]',
  importantTag: '[type="checkbox"]',
};
export default class EditTagModal extends BaseModal {
  constructor(pages: Pages) {
    super(pages, SELECTORS.thisDialog);
  }

  get tagNameField() {
    return new InputField(this.page, SELECTORS.tagName);
  }

  get checkImportant() {
    return new Checkbox(this.page, SELECTORS.importantTag);
  }

  get saveTag() {
    return new Button(this.page, SELECTORS.saveTag);
  }
}
