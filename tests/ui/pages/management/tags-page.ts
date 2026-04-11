import { Locator } from '@playwright/test';
import Button from '../../elements/button';
import List from '../../elements/list';
import DeleteTagModal from '../modals/delete-tag-modal';
import ManagementPage from './management-page';

const SELECTORS = {
  createTag: `button:has-text("Create tag")`,
  tagLineRoot: '.infinite-scroll-component',
  tagLineItem: 'p[title]',
  tagLineItemName: '.MuiTypography-body1.MuiTypography-noWrap',
  tagString: tagName => `div .infinite-scroll-component > div:has-text("${tagName}")`,
  tagImportantMark: 'p:text-is("important")',
};
export default class TagsPage extends ManagementPage {
  deleteTagModal = new DeleteTagModal(this.pages);

  get createTag() {
    return new Button(this.page, SELECTORS.createTag);
  }

  get tagsList() {
    return new List(this.page, SELECTORS.tagLineRoot, SELECTORS.tagLineItem);
  }

  public normalTag(tagName: string): Locator {
    return this.page.locator(SELECTORS.tagString(tagName));
  }

  public importantTag(tagName: string): Locator {
    return this.normalTag(tagName).locator(SELECTORS.tagImportantMark);
  }

  async getAllTags() {
    const allTags = [];
    const tagLineCount = await this.page.locator(SELECTORS.tagLineItemName).count();
    for (let i = 0; i < tagLineCount; i++) {
      const tagName = await this.page.locator(SELECTORS.tagLineItemName).nth(i).innerText();
      allTags.push(tagName);
    }
    return allTags;
  }

  async isTagVisible(name: string) {
    await this.page.waitForSelector(SELECTORS.tagString(name), { state: 'visible' });
    return this.page.locator(SELECTORS.tagString(name)).isVisible();
  }

  async isTagInvisible(name: string) {
    return this.page.locator(SELECTORS.tagString(name)).isHidden();
  }

  async addTag(name: string) {
    await this.createTag.click();
    await this.pages.modals.addTag.tagNameField.fill(name);
    await this.pages.modals.addTag.addNewTag.click();
  }

  async addImportantTag(name: string) {
    await this.createTag.click();
    await this.pages.modals.addTag.tagNameField.fill(name);
    await this.pages.modals.addTag.checkImportant(0);
    await this.pages.modals.addTag.addNewTag.click();
  }

  async editTag(name: string) {
    await this.page
      .locator(SELECTORS.tagString(name))
      .locator('button', { hasText: 'Edit' })
      .click();
  }

  async openDeleteModal(name: string) {
    await this.page
      .locator(SELECTORS.tagString(name))
      .locator('button', { hasText: 'Delete' })
      .click();
  }

  async waitUntilTagInvisible(tagName: string | Array<string>) {
    if (typeof tagName === 'string') {
      await this.page.waitForSelector(SELECTORS.tagString(tagName), { state: 'hidden' });
    } else {
      const tags = Array.from(tagName);
      for (const tag of tags) {
        await this.page.waitForSelector(SELECTORS.tagString(tag), { state: 'hidden' });
      }
    }
  }

  async waitUntilTagVisible(tagName: string | Array<string>) {
    if (typeof tagName === 'string') {
      await this.page.waitForSelector(SELECTORS.tagString(tagName), { state: 'visible' });
    } else {
      const tags = Array.from(tagName);
      for (const tag of tags) {
        await this.page.waitForSelector(SELECTORS.tagString(tag), { state: 'visible' });
      }
    }
  }
}
