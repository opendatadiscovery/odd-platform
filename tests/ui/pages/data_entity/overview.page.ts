import Button from '../../elements/button';
import InputField from '../../elements/input-field';
import DataEntityPage from './data_entity.page';

const SELECTORS = {
  addOwnerButton: `text=Add Owner`,
  inputOwnerName: `[placeholder="Search name"]`,
  inputOwnerTitle: `[placeholder="Search title"]`,
  autocomplete: text => `[role="presentation"]:has-text('${text}')`,
  saveNewOwnerButton: `[type="submit"]`,
  addTagButton: `.MuiButton-root.MuiButton-text.MuiButton-textPrimary.MuiButton-sizeSmall:has-text('Add Tags')`,
  inputTagName: `[role="combobox"]`,
  saveButton: `[type="submit"]`,
  addGroup: `.MuiButtonBase-root.MuiButton-root.MuiButton-text.MuiButton-textPrimary.MuiButton-sizeSmall:has-text('Add to group')`,
};

export default class OverviewPage extends DataEntityPage {
  get addOwner() {
    return new Button(this.page, SELECTORS.addOwnerButton);
  }

  get inputName() {
    return new InputField(this.page, SELECTORS.inputOwnerName);
  }

  get inputTitle() {
    return new InputField(this.page, SELECTORS.inputOwnerTitle);
  }

  get inputTag() {
    return new InputField(this.page, SELECTORS.inputTagName);
  }

  async getField(inputName: 'Name' | 'Tag' | 'Title', name: string, text: string) {
    await this[`input${inputName}`].fill(name);
    await this.page.locator(SELECTORS.autocomplete(text)).click();
  }

  async createOwner(name: string, textName: string, title: string, textTitle: string) {
    await this.addOwner.click();
    await this.getField('Name', name, textName);
    await this.getField('Title', title, textTitle);
    await this.page.locator(SELECTORS.saveNewOwnerButton).click();
  }

  get addTag() {
    return new Button(this.page, SELECTORS.addTagButton);
  }

  async createTag(name: string, text: string) {
    await this.addTag.click();
    await this.getField('Tag', name, text);
    await this.page.locator(SELECTORS.saveButton).click();
  }
}
