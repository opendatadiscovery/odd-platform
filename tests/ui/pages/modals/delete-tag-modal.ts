import Button from '../../elements/button';
import { Pages } from '../index';
import BaseModal from './base-modal';

const SELECTORS = {
  thisDialog: 'div[role="dialog"]',
  deleteTag: 'button:has-text:"Delete"',
  deleteTagConfirm: 'text=Delete Tag',
};
export default class DeleteTagModal extends BaseModal {
  constructor(pages: Pages) {
    super(pages, SELECTORS.thisDialog);
  }

  get deleteTagConfirm() {
    return new Button(this.page, SELECTORS.deleteTagConfirm);
  }
}
