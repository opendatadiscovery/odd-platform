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
  editButton: `[data-qa="edit_labels"]`,
};

export default class StructurePage extends DataEntityPage {
  private get resultsList() {
    return new List(this.page, SELECTORS.resultsList, SELECTORS.listItem);
  }

  private get inputDescription() {
    return new InputField(this.page, SELECTORS.inputDescription);
  }

  private get createNewLabelLink() {
    return new Button(this.page, SELECTORS.createNewLabelLink);
  }

  private get inputField() {
    return new InputField(this.page, SELECTORS.inputLabel);
  }

  private get submitButton() {
    return new Button(this.page, SELECTORS.submitButton);
  }

  get goToStructureTab() {
    return new Button(this.page, SELECTORS.structureTab);
  }

  private async clickEditButton() {
    await new Button(this.page, SELECTORS.editButton).click();
  }

  async addLabel(name: string, label: string) {
    await this.clickEditButton();
    await this.inputField.fill(label);
    await this.createNewLabelLink.click();
    await this.submitButton.click();
  }
}
