import Button from '../../elements/button';
import InputField from '../../elements/input-field';
import { Pages } from '../index';
import BaseModal from './base-modal';

const SELECTORS = {
  thisDialog: 'div[role="dialog"]',
  tagName: '[placeholder="Tag Name"]',
  addTag: '[type="submit"]',
  importantTag: '[type="checkbox"]',
  addOneMoreTag: 'div[role="dialog"] button:has-text("Create tag")',
  tagLineRoot: '.infinite-scroll-component',
};
export default class AddTagModal extends BaseModal {
  constructor(pages: Pages) {
    super(pages, SELECTORS.thisDialog);
  }

  get tagNameField() {
    return new InputField(this.page, SELECTORS.tagName);
  }

  get addNewTag() {
    return new Button(this.page, SELECTORS.addTag);
  }

  async checkImportant(indexOfCheckbox: number) {
    await this.page.locator(SELECTORS.importantTag).nth(indexOfCheckbox).click();
  }

  async isCheckboxMarked(indexOfCheckbox: number) {
    await this.page.locator(SELECTORS.importantTag).nth(indexOfCheckbox).inputValue();
  }

  get addOneMoreTag() {
    return new Button(this.page, SELECTORS.addOneMoreTag);
  }

  async isTagNameInputVisible(numberOfInput: number) {
    await this.page.locator(SELECTORS.tagName).nth(numberOfInput).isVisible();
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
