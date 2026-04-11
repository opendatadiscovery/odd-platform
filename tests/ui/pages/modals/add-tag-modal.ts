import Button from '../../elements/button';
import InputField from '../../elements/input-field';
import TextBox from '../../elements/text-box';
import { Pages } from '../index';
import BaseModal from './base-modal';

const SELECTORS = {
  thisDialog: 'div[role="dialog"]',
  dialogTitle: 'div[role="dialog"] h2',
  tagName: '[placeholder="Tag Name"]',
  tagNameCleanButton: '[placeholder="Tag Name"] >> .. >> [type="button"]',
  closeDialogButton: 'div[role="dialog"] h2 >> [type="button"]',
  addTag: '[type="submit"]',
  importantTag: '[type="checkbox"]',
  addOneMoreTag: 'div[role="dialog"] button:has-text("Add")',
  tagLineRoot: '.infinite-scroll-component',
  deleteTagButton: '[type="button"] div:has-text("Delete")',
};
export default class AddTagModal extends BaseModal {
  constructor(pages: Pages) {
    super(pages, SELECTORS.thisDialog);
  }

  get closeDialog() {
    return new Button(this.page, SELECTORS.closeDialogButton);
  }

  get dialogTitle() {
    return new TextBox(this.page, SELECTORS.dialogTitle);
  }

  get tagNameField() {
    return new InputField(this.page, SELECTORS.tagName);
  }

  get addNewTag() {
    return new Button(this.page, SELECTORS.addTag);
  }

  get tagNameCleanButton() {
    return new Button(this.page, SELECTORS.tagNameCleanButton);
  }

  get deleteButton() {
    return new Button(this.page, SELECTORS.deleteTagButton);
  }

  async checkImportant(indexOfCheckbox: number) {
    await this.page.locator(SELECTORS.importantTag).nth(indexOfCheckbox).click();
  }

  get addOneMoreTag() {
    return new Button(this.page, SELECTORS.addOneMoreTag);
  }

  async deleteTag(numberOfButton: number) {
    await this.modal.locator(SELECTORS.deleteTagButton).nth(numberOfButton).click();
  }

  async fillAllTagName(name: string) {
    const newTags = [];
    const inputCount = await this.page.locator(SELECTORS.tagName).count();
    for (let i = 0; i < inputCount; i++) {
      await this.page.locator(SELECTORS.tagName).nth(i).fill(`${name}_${i}`);
      newTags.push(`${name}_${i}`);
    }
    return newTags;
  }
}
