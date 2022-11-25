import Button from '../../elements/button';
import InputField from '../../elements/input-field';
import DataEntityPage from './data_entity.page';

const SELECTORS = {
  structureTab: `[role="tab"]:has-text("Structure")`,
  autocomplete: text => `[role="presentation"]:has-text('${text}')`,
  submitButton: `[type="submit"]`,
  columnString: name => `.MuiGrid-root.MuiGrid-container.css-1rwljbm:has-text('${name}')`,
  inputLabel: `[placeholder="Enter label name…"]`,
  inputDescription: `[name="internalDescription"]`,
};

export default class StructurePage extends DataEntityPage {
  async editColumn(name: string) {
    await this.page
      .locator(SELECTORS.columnString(name))
      .locator('button', { hasText: 'Edit' })
      .click();
  }

  get inputLabel() {
    return new InputField(this.page, SELECTORS.inputLabel);
  }

  get inputDescription() {
    return new InputField(this.page, SELECTORS.inputDescription);
  }

  async getField(inputName: 'Label', name: string) {
    await this[`input${inputName}`].fill(name);
    await this.page
      .locator(SELECTORS.autocomplete(`No result. Create new label "${name}"`))
      .click();
  }

  get submitButton() {
    return new Button(this.page, SELECTORS.submitButton);
  }

  get goToStructureTab() {
    return new Button(this.page, SELECTORS.structureTab);
  }

  async addLabel(name: string, label: string, description: string) {
    await this.editColumn(`${name}`);
    await this.getField('Label', label);
    await this.inputDescription.fill(description);
    await this.submitButton.click();
  }
}
