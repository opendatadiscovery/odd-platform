import { expect } from '@playwright/test';
import { test } from '../../config/test-base';

test.describe(() => {
  test.beforeEach(async ({ steps: { pages }, page }) => {
    await test.step(`I open Tags page`, async () => {
      await page.goto('');
      await pages.topPanel.clickTab('Management');
      await pages.management.tags.click();
    });
  });

  /**
   * /project/1/test-cases/33
   */
  test(`Delete unimportant tag`, async ({ steps: { pages } }) => {
    const tagName = 'tag_4';
    await test.step(`I create tag`, async () => {
      await pages.tags.addTag(`${tagName}`);
    });
    await test.step(`I click on 'Delete' button`, async () => {
      await pages.tags.openDeleteModal(`${tagName}`);
      expect(await pages.modals.deleteTag.isOpened()).toBeTruthy();
    });
    await test.step(`I delete tag`, async () => {
      await pages.modals.deleteTag.deleteTagConfirm.click();
      await pages.tags.waitUntilTagInvisible(tagName);
      expect(await pages.tags.isTagInvisible(`${tagName}`)).toBeTruthy();
    });
  });

  /**
   * /project/1/test-cases/34
   */
  test(`Delete important tag`, async ({ steps: { pages } }) => {
    const tagName = 'tag_5';
    await test.step(`I create tag`, async () => {
      await pages.tags.addImportantTag(`${tagName}`);
    });
    await test.step(`I click on 'Delete' button`, async () => {
      await pages.tags.openDeleteModal(`${tagName}`);
      expect(await pages.modals.deleteTag.isOpened()).toBeTruthy();
    });
    await test.step(`I delete tag`, async () => {
      await pages.modals.deleteTag.deleteTagConfirm.click();
      await pages.tags.waitUntilTagInvisible(tagName);
      expect(await pages.tags.isTagInvisible(tagName)).toBeTruthy();
    });
  });
});
