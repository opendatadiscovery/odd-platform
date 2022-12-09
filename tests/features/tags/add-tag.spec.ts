import { expect } from '@playwright/test';
import { test } from '../../config/test-base';

test.describe('Tags', () => {
  let tagName: string;

  test.beforeEach(async ({ steps: { pages }, page }) => {
    await test.step(`I open Tags page`, async () => {
      await page.goto('');
      await pages.topPanel.clickTab('Management');
      await pages.management.tags.click();
    });
    await test.step(`And Click on 'Create Tag' button`, async () => {
      await pages.tags.createTag.click();
      expect(await pages.modals.addTag.isOpened()).toBeTruthy();
    });
  });

  /**
   * /project/1/test-cases/4
   */
  test(`Add new Tag`, async ({ steps: { pages } }) => {
    tagName = 'Test_tagName';
    await test.step(`I fill tag name ${tagName} and click 'create' button`, async () => {
      await pages.modals.addTag.tagNameField.fill(`${tagName}`);
      await pages.modals.addTag.addNewTag.click();
    });
    await test.step(`Then tag name ${tagName} present on the page`, async () => {
      expect(await pages.tags.isTagVisible(`${tagName}`)).toBeTruthy();
    });
  });

  /**
   * /project/1/test-cases/5
   */
  test(`Add new important tag`, async ({ steps: { pages } }) => {
    tagName = 'Test_importantTagName';
    await test.step(`I fill tag name ${tagName}`, async () => {
      await pages.modals.addTag.tagNameField.fill(`${tagName}`);
    });
    await test.step(`I mark checkbox 'important'`, async () => {
      await pages.modals.addTag.checkImportant(0);
    });
    await test.step(`I click 'create' button`, async () => {
      await pages.modals.addTag.addNewTag.click();
      await pages.tags.waitUntilTagVisible(tagName);
      expect(await pages.tags.isTagVisible(`${tagName}`)).toBeTruthy();
      await expect(pages.tags.importantTag(tagName)).toBeVisible();
    });
  });

  /**
   * /project/1/test-cases/6
   */
  test(`Add several unimportant tags`, async ({ steps: { pages } }) => {
    await test.step(`I add one more tag`, async () => {
      await pages.modals.addTag.addOneMoreTag.click();
    });
    await test.step(`I fill inputs and click 'create' button`, async () => {
      await pages.modals.addTag.fillAllTagName('tag');
      await pages.modals.addTag.addNewTag.click();
    });
    await test.step(`I check new tags`, async () => {
      expect(await pages.tags.tagsList.isListItemVisible('tag_0')).toBeTruthy();
      expect(await pages.tags.tagsList.isListItemVisible('tag_1')).toBeTruthy();
    });
  });

  /**
   * /project/1/test-cases/7
   */
  test(`Add several tags, one important`, async ({ workerId, steps: { pages } }) => {
    const tagNamePrefix = `tag_test${workerId}`;

    await test.step(`I add one more tag`, async () => {
      await pages.modals.addTag.addOneMoreTag.click();
    });
    await test.step(`I fill inputs, check 'important' and click 'create' button`, async () => {
      await pages.modals.addTag.fillAllTagName(`tag_test${workerId}`);
      await pages.modals.addTag.checkImportant(1);
      await pages.modals.addTag.addNewTag.click();
    });
    await test.step(`I check new tags`, async () => {
      await expect(pages.tags.normalTag(`${tagNamePrefix}_0`)).toBeVisible();
      await expect(pages.tags.importantTag(`${tagNamePrefix}_1`)).toBeVisible();
    });
  });

  /**
   * /project/1/test-cases/29
   */
  test(`Add several important tags`, async ({ workerId, steps: { pages } }) => {
    const tagNamePrefix = `new_test${workerId}`;

    await test.step(`I add one more tag`, async () => {
      await pages.modals.addTag.addOneMoreTag.click();
    });
    await test.step(`I fill inputs, check 'important' and click 'create' button`, async () => {
      await pages.modals.addTag.fillAllTagName(tagNamePrefix);
      await pages.modals.addTag.checkImportant(0);
      await pages.modals.addTag.checkImportant(1);
      await pages.modals.addTag.addNewTag.click();
    });
    await test.step(`I check new tags`, async () => {
      await expect(pages.tags.importantTag(`${tagNamePrefix}_0`)).toBeVisible();
      await expect(pages.tags.importantTag(`${tagNamePrefix}_1`)).toBeVisible();
    });
  });
});
