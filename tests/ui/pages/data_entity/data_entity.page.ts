import BasePage from '../base-page';

const SELECTORS = {
  addOwner: `text=Add Owner`,
  inputName: `[placeholder="Search name"]`,
  inputRole: `[placeholder="Search title"]`,
  autocomplete: text => `[role="presentation"]:has-text('${text}')`,
  addOwnerButton: `[type="submit"]`,
  addTag: `.MuiButton-root.MuiButton-text.MuiButton-textPrimary.MuiButton-sizeSmall:has-text('Add Tags')`,
  inputTagName: `[role="combobox"]`,
  saveButton: `[type="submit"]`,
  ownerString: text => `.sc-dxtBLK.hWlgkE:has-text('${text}')`,
  tagString: text => `.MuiTypography-root.MuiTypography-body1.sc-jdAMXn:has-text('${text}')`,
    tag: text => `p:has-text('${text}')`,
    addGroup: `.MuiButtonBase-root.MuiButton-root.MuiButton-text.MuiButton-textPrimary.MuiButton-sizeSmall:has-text('Add to group')`
};

export default class DataEntityPage extends BasePage {
  async openAddOwnerModal() {
    await this.page.locator(SELECTORS.addOwner).click();
  }

  async fillInputOwnerName(name: string, text: string) {
    await this.page.locator(SELECTORS.inputName).fill(name);
    await this.page.locator(SELECTORS.autocomplete(text)).click();
  }

  async fillInputOwnerRole(name: string, text: string) {
    await this.page.locator(SELECTORS.inputRole).fill(name);
    await this.page.locator(SELECTORS.autocomplete(text)).click();
  }

  async createOwner(name: string, textName: string, title: string, textTitle: string) {
    await this.openAddOwnerModal();
    await this.fillInputOwnerName(name, textName);
    await this.fillInputOwnerRole(title, textTitle);
    await this.page.locator(SELECTORS.addOwnerButton).click();
    await this.locator(SELECTORS.ownerString(name)).waitFor({ state: 'visible' });
    await this.locator(SELECTORS.ownerString(title)).waitFor({ state: 'visible' });
  }

  async openAddTagModal() {
    await this.page.locator(SELECTORS.addTag).click();
  }

  async fillInputTagName(name: string, text: string) {
    await this.page.locator(SELECTORS.inputTagName).fill(name);
    await this.page.locator(SELECTORS.autocomplete(text)).click();
  }

  async createTag(name: string, text: string) {
    await this.openAddTagModal();
    await this.fillInputTagName(name, text);
    await this.page.locator(SELECTORS.saveButton).click();
    await this.page.locator(SELECTORS.tag(name)).waitFor({ state: 'visible' });
  }
}
