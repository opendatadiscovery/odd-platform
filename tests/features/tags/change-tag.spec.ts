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
   * /project/1/test-cases/30
   */
  test(`Change tag name`, async ({ steps: { pages } }) => {
    const tagName = 'tag_1';
    const changedName = 'tag_changedName';
    await test.step(`I create tag`, async () => {
      await pages.tags.addTag(tagName);
    });
    await test.step(`I click on "Edit" button`, async () => {
      await pages.tags.editTag(`${tagName}`);
      expect(await pages.modals.editTag.isOpened()).toBeTruthy();
    });
    await test.step(`I change name of the tag and click 'save' button`, async () => {
      await pages.modals.editTag.tagNameField.fill(`${changedName}`);
      await pages.modals.editTag.saveTag.click();
    });
    await test.step(`Then tag name ${changedName} present on the page`, async () => {
      await pages.tags.waitUntilTagVisible(changedName);
      expect(await pages.tags.isTagVisible(changedName)).toBeTruthy();
    });
  });

  /**
   * /project/1/test-cases/31
   */
  test(`Mark tag as important`, async ({ steps: { pages } }) => {
    const tagName = 'tag_2';
    await test.step(`I create tag`, async () => {
      await pages.tags.addTag(tagName);
    });
    await test.step(`I click on 'Edit' button`, async () => {
      await pages.tags.editTag(`${tagName}`);
      expect(await pages.modals.editTag.isOpened()).toBeTruthy();
    });
    await test.step(`I mark checkbox 'important' and click 'Save' button`, async () => {
      await pages.modals.editTag.checkImportant.click();
      await pages.modals.editTag.saveTag.click();
      await pages.tags.waitUntilTagVisible(tagName);
      expect(await pages.tags.isTagVisible(`${tagName}`)).toBeTruthy();
      await expect(pages.tags.importantTag(tagName)).toBeVisible();
    });
  });

  /**
   * /project/1/test-cases/32
   */
  test(`Mark tag as unimportant`, async ({ steps: { pages } }) => {
    const tagName = 'tag_3';
    await test.step(`I create tag`, async () => {
      await pages.tags.addImportantTag(tagName);
    });
    await test.step(`I click on 'Edit' button`, async () => {
      await pages.tags.editTag(`${tagName}`);
      expect(await pages.modals.editTag.isOpened()).toBeTruthy();
    });
    await test.step(`I uncheck checkbox 'important' and click 'Save' button`, async () => {
      await pages.modals.editTag.checkImportant.click();
      await pages.modals.editTag.saveTag.click();
      await pages.tags.waitUntilTagVisible(tagName);
      expect(await pages.tags.isTagVisible(`${tagName}`)).toBeTruthy();
      await expect(pages.tags.importantTag(tagName)).toBeHidden();
    });
  });
});
