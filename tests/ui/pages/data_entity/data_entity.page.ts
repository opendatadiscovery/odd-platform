import Button from '../../elements/button';
import InputField from '../../elements/input-field';
import BasePage from '../base-page';

const SELECTORS = {
  addOwnerButton: `text=Add Owner`,
  inputName: `[placeholder="Search name"]`,
  inputRole: `[placeholder="Search title"]`,
  autocomplete: text => `[role="presentation"]:has-text('${text}')`,
  saveNewOwnerButton: `[type="submit"]`,
  addTag: `.MuiButton-root.MuiButton-text.MuiButton-textPrimary.MuiButton-sizeSmall:has-text('Add Tags')`,
  inputTagName: `[role="combobox"]`,
  saveButton: `[type="submit"]`,
  addedOwner: text => `.sc-dxtBLK.hWlgkE:has-text('${text}')`,
  addedTag: text => `p:has-text('${text}')`,
  addGroup: `.MuiButtonBase-root.MuiButton-root.MuiButton-text.MuiButton-textPrimary.MuiButton-sizeSmall:has-text('Add to group')`,
};

export default class DataEntityPage extends BasePage {
  get addOwner() {
    return new Button(this.page, SELECTORS.addOwnerButton);
  }

  get inputName() {
    return new InputField(this.page, SELECTORS.inputName);
  }

  get inputTitle() {
    return new InputField(this.page, SELECTORS.inputRole);
  }

  get inputTag() {
    return new InputField(this.page, SELECTORS.inputTagName);
  }

  async getField(inputName: 'Name' | 'Tag' | 'Title', name: string, text: string) {
    await (this[`input${inputName}`] ).fill(name);
    await this.page.locator(SELECTORS.autocomplete(text)).click();
  }

  async createOwner(name: string, textName: string, title: string, textTitle: string) {
    await this.addOwner.click();
    await this.getField('Name', name, textName);
    await this.getField('Title', title, textTitle);
    await this.page.locator(SELECTORS.saveNewOwnerButton).click();
    await this.locator(SELECTORS.addedOwner(name)).waitFor({ state: 'visible' });
    await this.locator(SELECTORS.addedOwner(title)).waitFor({ state: 'visible' });
  }

  get addTag() {
    return new Button(this.page, SELECTORS.addTag);
  }

  async createTag(name: string, text: string) {
    await this.addTag.click();
    await this.getField('Tag', name, text);
    await this.page.locator(SELECTORS.saveButton).click();
    await this.page.locator(SELECTORS.addedTag(name)).waitFor({ state: 'visible' });
  }
}
