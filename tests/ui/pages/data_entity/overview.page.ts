import Button from '../../elements/button';
import Dropdown from '../../elements/dropdown';
import InputField from '../../elements/input-field';
import Radio from '../../elements/radio';
import TextBox from '../../elements/text-box';
import DataEntityPage from './data_entity.page';

const SELECTORS = {
  addOwnerButton: `text=Add Owner`,
  inputOwnerName: `[placeholder="Search name"]`,
  inputOwnerTitle: `[name="titleName"] input`,
  saveNewOwnerButton: `[type="submit"]`,
  inputTagName: `[role="combobox"]`,
  saveButton: `[type="submit"]`,
  addCustomDescription: `[data-qa="add_description"]`,
  customDescriptionInput: `textarea`,
  saveDescriptionButton: `button:has-text("Save")`,
  addCustomMetadataButton: `[data-qa="add_metadata"]`,
  inputCustomMetadata: `[data-qa="add_custom_metadata_input"]`,
  customMetadataDropdownList: `[role="listbox"]`,
  addMetadataInputAnchor: `[data-qa="add_custom_metadata_type_select"] >> ..`,
  customMetadataListItem: `li`,
  addCustomMetadataTrueRadioButton: `[data-qa="add_custom_metadata_radio_button_true"]`,
  addCustomName: `[data-qa="add_business_name"]`,
  customNameInput: `[name="internalName"]`,
  createNewEntityLink: `[role="presentation"]:has-text('Create new')`,
  successMessage: `p:has-text('successfully created')`,
};
type InputName = 'Name' | 'Tag' | 'Title' | 'Metadata';

export default class OverviewPage extends DataEntityPage {
  private get saveButton() {
    return new Button(this.page, SELECTORS.saveButton);
  }

  private get addOwnerButton() {
    return new Button(this.page, SELECTORS.addOwnerButton);
  }

  private get inputName() {
    return new InputField(this.page, SELECTORS.inputOwnerName);
  }

  private get inputTitle() {
    return new InputField(this.page, SELECTORS.inputOwnerTitle);
  }

  private get inputTag() {
    return new InputField(this.page, SELECTORS.inputTagName);
  }

  private get createNewEntityLink() {
    return new Button(this.page, SELECTORS.createNewEntityLink);
  }

  private get addCustomDescriptionButton() {
    return new Button(this.page, SELECTORS.addCustomDescription);
  }

  private get customDescriptionText() {
    return new InputField(this.page, SELECTORS.customDescriptionInput);
  }

  private get saveDescriptionButton() {
    return new Button(this.page, SELECTORS.saveDescriptionButton);
  }

  private get inputMetadata() {
    return new InputField(this.page, SELECTORS.inputCustomMetadata);
  }

  private get addCustomMetadataButton() {
    return new Button(this.page, SELECTORS.addCustomMetadataButton);
  }

  private get typeDropdown() {
    return new Dropdown(
      this.page,
      SELECTORS.addMetadataInputAnchor,
      SELECTORS.customMetadataDropdownList,
      SELECTORS.customMetadataListItem,
    );
  }

  public get successMessage() {
    return new TextBox(this.page, SELECTORS.successMessage);
  }

  private get customNameButton() {
    return new Button(this.page, SELECTORS.addCustomName);
  }

  private get customNameInput() {
    return new InputField(this.page, SELECTORS.customNameInput);
  }

  private get addCustomMetadataTrueRadioButton() {
    return new Radio(this.page, SELECTORS.addCustomMetadataTrueRadioButton);
  }

  async createOwner(name: string, title: string) {
    await this.addOwnerButton.click();
    await this.inputName.fill(name);
    await this.createNewEntityLink.click();
    await this.inputTitle.fill(title);
    await this.createNewEntityLink.click();
    await this.saveButton.click();
    await this.successMessage.waitForElementToBeVisible();
  }

  async fillCustomDescriptionInput(text: string) {
    await this.addCustomDescriptionButton.click();
    await this.customDescriptionText.fill(text);
    await this.saveDescriptionButton.click();
  }

  async createCustomMetadata(name: string) {
    await this.addCustomMetadataButton.click();
    await this.inputMetadata.fill(name);
    await this.createNewEntityLink.click();
    await this.typeDropdown.set('Boolean', { open: true });
    await this.addCustomMetadataTrueRadioButton.click();
    await this.saveButton.click();
  }

  async addCustomName(name: string) {
    await this.customNameButton.click();
    await this.customNameInput.fill(name);
    await this.saveButton.click();
  }
}
