import Button from '../../elements/button';
import InputField from '../../elements/input-field';
import List from '../../elements/list';
import DataEntityPage from './data_entity.page';

const SELECTORS = {
  structureTab: `[role="tab"]:has-text("Structure")`,
  submitButton: `[type="submit"]`,
  inputLabel: `[placeholder="Enter label name…"]`,
  inputDescription: `[name="internalDescription"]`,
  createNewLabelLink: `[role="presentation"]:has-text('Create new')`,
  resultsList: `[aria-label="grid"]`,
  listItem: `[role="rowgroup"] >> div`,
  editButton: `button:has-text('Edit')`,
};

export default class StructurePage extends DataEntityPage {
  get resultsList() {
    return new List(this.page, SELECTORS.resultsList, SELECTORS.listItem);
  }

  get inputDescription() {
    return new InputField(this.page, SELECTORS.inputDescription);
  }

  get createNewLabelLink() {
    return new Button(this.page, SELECTORS.createNewLabelLink);
  }

  get inputField() {
    return new InputField(this.page, SELECTORS.inputLabel);
  }

  get submitButton() {
    return new Button(this.page, SELECTORS.submitButton);
  }

  get goToStructureTab() {
    return new Button(this.page, SELECTORS.structureTab);
  }

  async clickEditButton(listItemName: string) {
    const listItem = this.resultsList.getListElement(listItemName);
    await listItem.locator(SELECTORS.editButton).click();
  }

  async addLabel(name: string, label: string, description: string) {
    await this.clickEditButton(name);
    await this.inputField.fill(label);
    await this.createNewLabelLink.click();
    await this.inputDescription.fill(description);
    await this.submitButton.click();
  }
}
