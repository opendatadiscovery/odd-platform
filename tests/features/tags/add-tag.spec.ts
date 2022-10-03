import { expect } from '@playwright/test';
import { test } from '../../config/test-base';

test.describe('Tags', () => {
  let tagName;

  test.beforeEach(async ({ steps: { pages }, page }) => {
    await test.step(`I open Tags page`, async () => {
      await page.goto('');
      await pages.topPanel.goToManagement();
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
      expect(pages.modals.addTag.isCheckboxMarked(0)).toBeTruthy();
    });
    await test.step(`I click 'create' button`, async () => {
      await pages.modals.addTag.addNewTag.click();
      await pages.tags.waitUntilTagVisible(tagName);
      expect(await pages.tags.isTagVisible(`${tagName}`)).toBeTruthy();
      expect(await pages.tags.isTagImportant(`${tagName}`)).toBeTruthy();
    });
  });

  /**
   * /project/1/test-cases/6
   */
  test(`Add several unimportant tags`, async ({ steps: { pages } }) => {
    let tags;
    let tagsAll;
    await test.step(`I add one more tag`, async () => {
      await pages.modals.addTag.addOneMoreTag.click();
      expect(pages.modals.addTag.isTagNameInputVisible(0)).toBeTruthy();
      expect(pages.modals.addTag.isTagNameInputVisible(1)).toBeTruthy();
    });
    await test.step(`I fill inputs and click 'create' button`, async () => {
      tags = await pages.modals.addTag.fillAllTagName('tag');
      await pages.modals.addTag.addNewTag.click();
      tagsAll = await pages.tags.getAllTags();
      await pages.tags.waitUntilTagVisible(tags);
    });
    await test.step(`I check new tags`, async () => {
      expect(await pages.tags.tagsList.isVisible()).toBeTruthy();
      expect(tagsAll).toEqual(expect.arrayContaining(tags));
    });
  });

  /**
   * /project/1/test-cases/7
   */
  test(`Add several tags, one important`, async ({ steps: { pages } }) => {
    let tags;
    let tagsAll;
    await test.step(`I add one more tag`, async () => {
      await pages.modals.addTag.addOneMoreTag.click();
      expect(pages.modals.addTag.isTagNameInputVisible(0)).toBeTruthy();
      expect(pages.modals.addTag.isTagNameInputVisible(1)).toBeTruthy();
    });
    await test.step(`I fill inputs, check 'important' and click 'create' button`, async () => {
      tags = await pages.modals.addTag.fillAllTagName('tag_test');
      await pages.modals.addTag.checkImportant(1);
      expect(pages.modals.addTag.isCheckboxMarked(1)).toBeTruthy();
      await pages.modals.addTag.addNewTag.click();
      await pages.tags.waitUntilTagVisible(tags);
      tagsAll = await pages.tags.getAllTags();
    });
    await test.step(`I check new tags`, async () => {
      expect(await pages.tags.tagsList.isVisible()).toBeTruthy();
      expect(tagsAll).toEqual(expect.arrayContaining(tags));
      expect(await pages.tags.isTagImportant(`tag_test_1`)).toBeTruthy();
    });
  });

  /**
   * /project/1/test-cases/29
   */
  test(`Add several important tags`, async ({ steps: { pages } }) => {
    let tags;
    let tagsAll;
    await test.step(`I add one more tag`, async () => {
      await pages.modals.addTag.addOneMoreTag.click();
      expect(pages.modals.addTag.isTagNameInputVisible(0)).toBeTruthy();
      expect(pages.modals.addTag.isTagNameInputVisible(1)).toBeTruthy();
    });
    await test.step(`I fill inputs, check 'important' and click 'create' button`, async () => {
      tags = await pages.modals.addTag.fillAllTagName('new_test');
      await pages.modals.addTag.checkImportant(0);
      await pages.modals.addTag.checkImportant(1);
      await pages.modals.addTag.addNewTag.click();
      await pages.tags.waitUntilTagVisible(tags);
      tagsAll = await pages.tags.getAllTags();
    });
    await test.step(`I check new tags`, async () => {
      expect(await pages.tags.tagsList.isVisible()).toBeTruthy();
      expect(tagsAll).toEqual(expect.arrayContaining(tags));
      expect(await pages.tags.isTagImportant(`new_test_0`)).toBeTruthy();
      expect(await pages.tags.isTagImportant(`new_test_1`)).toBeTruthy();
    });
  });
});
