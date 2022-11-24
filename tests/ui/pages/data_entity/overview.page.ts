import Button from '../../elements/button';
import InputField from '../../elements/input-field';
import DataEntityPage from './data_entity.page';
import Dropdown from "../../elements/dropdown";

const SELECTORS = {
  addOwnerButton: `text=Add Owner`,
  inputOwnerName: `[placeholder="Search name"]`,
  inputOwnerTitle: `[placeholder="Search title"]`,
  autocomplete: text => `[role="presentation"]:has-text('${text}')`,
  saveNewOwnerButton: `[type="submit"]`,
  addTagButton: `.MuiButton-root.MuiButton-text.MuiButton-textPrimary.MuiButton-sizeSmall:has-text('Add Tags')`,
  inputTagName: `[role="combobox"]`,
  saveButton: `[type="submit"]`,
    addCustomDescription: `.MuiButtonBase-root.MuiButton-root.MuiButton-text.MuiButton-textPrimary.MuiButton-sizeMedium:has-text('Add description')`,
    customDescriptionInput: `.w-md-editor-text-input`,
    saveDescriptionButton: `button:text-is('Save')`,
    addCustomMetadata: `.MuiButtonBase-root.MuiButton-root.MuiButton-text.MuiButton-textPrimary.MuiButton-sizeMedium:has-text('Add metadata')`,
    inputCustomMetadata: `[placeholder="Metadata Name"]`,
    customMetadataSelectType: `[role="listbox"]`,
    customMetadataInputType: `input[placeholder="Type"] >> ..`,
    customMetadataTypeOption: `li`,
    radioButtonType: name => `label:has-text('${name}')`,
    addCustomName: `.MuiButtonBase-root:has-text('Add business name')`,
    inputCustomName: `[name="internalName"]`,
};

export default class OverviewPage extends DataEntityPage {

    get saveButton() {
        return new Button(this.page, SELECTORS.saveButton)
    }

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

  async getField(inputName: 'Name' | 'Tag' | 'Title' | 'Metadata', name: string) {
    await this[`input${inputName}`].fill(name);
    if (inputName === 'Name') {
    await this.page.locator(SELECTORS.autocomplete(`No result. Create new owner "${name}"`)).click();
    }
    else if (inputName === 'Tag') {
        await this.page.locator(SELECTORS.autocomplete(`No result. Create new tag "${name}"`)).click();
    }
    else if (inputName === 'Metadata') {
        await this.page.locator(SELECTORS.autocomplete(`No result. Create new custom data "${name}"`)).click();
    }
    else {
        await this.page.locator(SELECTORS.autocomplete(`No result. Create new title "${name}"`)).click();
    }
  }

  async createOwner(name: string, title: string) {
    await this.addOwner.click();
    await this.getField('Name', name);
    await this.getField('Title', title);
    await this.saveButton.click();
    }


  get addTag() {
    return new Button(this.page, SELECTORS.addTagButton);
  }

  async createTag(name: string) {
    await this.addTag.click();
    await this.getField('Tag', name);
    await this.saveButton.click();
  }

  get addCustomDescription() {
      return new Button(this.page, SELECTORS.addCustomDescription);
  }

  get customDescriptionText() {
      return new InputField(this.page, SELECTORS.customDescriptionInput);
  }

  get saveDescriptionButton() {
        return new Button(this.page, SELECTORS.saveDescriptionButton);
  }

  async fillCustomDescriptionInput(text:string) {
      await this.addCustomDescription.click();
      await this.customDescriptionText.fill(text);
      await this.saveDescriptionButton.click();
  }

  get inputMetadata() {
      return new InputField(this.page, SELECTORS.inputCustomMetadata)
  }

  get addCustomMetadata() {
      return new Button(this.page, SELECTORS.addCustomMetadata);
  }

  get openTypeSelect() {
      return new Dropdown(this.page, SELECTORS.customMetadataInputType, SELECTORS.customMetadataSelectType, SELECTORS.customMetadataTypeOption)
  }

  async createCustomMetadata(name: string) {
      await this.addCustomMetadata.click();
      await this.getField('Metadata', name);
      await this.openTypeSelect.set("Boolean", {open: true});
      await this.page.locator(SELECTORS.radioButtonType('Yes')).click()
      await this.saveButton.click();
  }

  get customNameButton() {
      return new Button(this.page, SELECTORS.addCustomName);
  }

  get inputCustomName() {
      return new InputField(this.page, SELECTORS.inputCustomName);
  }

  async addCustomName(name: string) {
      await this.customNameButton.click();
      await this.inputCustomName.fill(name);
      await this.saveButton.click();
  }
}
