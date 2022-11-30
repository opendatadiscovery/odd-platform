import Button from '../../elements/button';
import Dropdown from '../../elements/dropdown';
import InputField from '../../elements/input-field';
import DataEntityPage from './data_entity.page';
import Radio from "../../elements/radio";

const SELECTORS = {
  addOwnerButton: `text=Add Owner`,
  inputOwnerName: `[placeholder="Search name"]`,
  inputOwnerTitle: `[placeholder="Search title"]`,
  saveNewOwnerButton: `[type="submit"]`,
  inputTagName: `[role="combobox"]`,
  saveButton: `[type="submit"]`,
  addCustomDescription: `[data-qa="add_description"]`,
  customDescriptionInput: `textarea`,
  saveDescriptionButton: `button:text-is('Save')`,
  addCustomMetadata: `[data-qa="add_metadata"]`,
  inputCustomMetadata: `[data-qa="add_custom_metadata_input"]`,
  customMetadataDropdownList: `[role="listbox"]`,
  addMetadataInputField: `[data-qa="add_custom_metadata_type_select"] >> ..`,
  customMetadataListItem: `li`,
  typeRadioButtonTrue: `[data-qa="add_custom_metadata_radio_button_true"]`,
  addCustomName: `[data-qa="add_business_name"]`,
  inputCustomName: `[name="internalName"]`,
  createNewEntityLink: `[role="presentation"]:has-text('Create new')`,
};
type InputName = 'Name' | 'Tag' | 'Title' | 'Metadata';

export default class OverviewPage extends DataEntityPage {
  get saveButton() {
    return new Button(this.page, SELECTORS.saveButton);
  }

  get addOwnerButton() {
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

  get createNewEntityLink() {
    return new Button(this.page, SELECTORS.createNewEntityLink);
  }

  async getField(inputName: InputName, name: string) {
    await this[`input${inputName}`].fill(name);
  }

  get addCustomDescriptionButton() {
    return new Button(this.page, SELECTORS.addCustomDescription);
  }

  get customDescriptionText() {
    return new InputField(this.page, SELECTORS.customDescriptionInput);
  }

  get saveDescriptionButton() {
    return new Button(this.page, SELECTORS.saveDescriptionButton);
  }

  get inputMetadata() {
    return new InputField(this.page, SELECTORS.inputCustomMetadata);
  }

  get addCustomMetadata() {
    return new Button(this.page, SELECTORS.addCustomMetadata);
  }

  get openTypeSelect() {
    return new Dropdown(
      this.page,
      SELECTORS.addMetadataInputField,
      SELECTORS.customMetadataDropdownList,
      SELECTORS.customMetadataListItem,
    );
  }

  get customNameButton() {
    return new Button(this.page, SELECTORS.addCustomName);
  }

  get inputCustomName() {
    return new InputField(this.page, SELECTORS.inputCustomName);
  }

  get typeRadioButtonTrue() {
      return new Radio(this.page, SELECTORS.typeRadioButtonTrue)
  }

  async createOwner(name: string, title: string) {
    await this.addOwnerButton.click();
    await this.getField('Name', name);
    await this.createNewEntityLink.click();
    await this.getField('Title', title);
    await this.createNewEntityLink.click();
    await this.saveButton.click();
  }

  async fillCustomDescriptionInput(text: string) {
    await this.addCustomDescriptionButton.click();
    await this.customDescriptionText.fill(text);
    await this.saveDescriptionButton.click();
  }

  async createCustomMetadata(name: string) {
    await this.addCustomMetadata.click();
    await this.getField('Metadata', name);
      await this.createNewEntityLink.click();
      await this.openTypeSelect.set('Boolean', { open: true });
    await this.typeRadioButtonTrue.click();
    await this.saveButton.click();
  }

  async addCustomName(name: string) {
    await this.customNameButton.click();
    await this.inputCustomName.fill(name);
    await this.saveButton.click();
  }
}
