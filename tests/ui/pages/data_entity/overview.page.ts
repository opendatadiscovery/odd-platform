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

  async getField(inputName: 'Name' | 'Tag' | 'Title', name: string) {
    await this[`input${inputName}`].fill(name);
    if (inputName === 'Name') {
    await this.page.locator(SELECTORS.autocomplete(`No result. Create new owner "${name}"`)).click();
    }
    else if (inputName === 'Tag') {
        await this.page.locator(SELECTORS.autocomplete(`No result. Create new tag "${name}"`)).click();
    }
    else {
        await this.page.locator(SELECTORS.autocomplete(`No result. Create new title "${name}"`)).click();
    }
  }

  async createOwner(name: string, title: string) {
    await this.addOwner.click();
    await this.getField('Name', name);
    await this.getField('Title', title);
    await this.page.locator(SELECTORS.saveNewOwnerButton).click();
  }


  get addTag() {
    return new Button(this.page, SELECTORS.addTagButton);
  }

  async createTag(name: string) {
    await this.addTag.click();
    await this.getField('Tag', name);
    await this.page.locator(SELECTORS.saveButton).click();
  }
}
