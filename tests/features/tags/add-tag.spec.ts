import { expect } from '@playwright/test';
import { test } from '../../config/test-base';

test.describe('Tags', () => {
  let tag_name;

  test.beforeEach(async ({ steps: { pages }, page }) => {
    await test.step(`I open Tags page`, async () => {
      await page.goto('');
      await pages.top_panel.go_to_management();
      await pages.management.tags.click();
    });
    await test.step(`And Click on 'Create Tag' button`, async () => {
      await pages.tags.create_tag.click();
      expect(await pages.modals.add_tag.is_opened()).toBeTruthy();
    });
  });

  /**
   * /project/1/test-cases/4
   */
  test(`Add new Tag`, async ({ steps: { pages } }) => {
    tag_name = 'Test_tag_name';
    await test.step(`I fill tag name ${tag_name} and click 'create' button`, async () => {
      await pages.modals.add_tag.tag_name_field.fill(`${tag_name}`);
      await pages.modals.add_tag.add_new_tag.click();
    });
    await test.step(`Then tag name ${tag_name} present on the page`, async () => {
      expect(await pages.tags.is_tag_visible(`${tag_name}`)).toBeTruthy();
    });
  });

  /**
   * /project/1/test-cases/5
   */
  test(`Add new important tag`, async ({ steps: { pages } }) => {
    tag_name = 'Test_important_tag_name';
    await test.step(`I fill tag name ${tag_name}`, async () => {
      await pages.modals.add_tag.tag_name_field.fill(`${tag_name}`);
    });
    await test.step(`I mark checkbox 'important'`, async () => {
      await pages.modals.add_tag.check_important(0);
      expect(pages.modals.add_tag.is_checkbox_marked(0)).toBeTruthy();
    });
    await test.step(`I click 'create' button`, async () => {
      await pages.modals.add_tag.add_new_tag.click();
      await pages.tags.wait_until_tag_visible(tag_name);
      expect(await pages.tags.is_tag_visible(`${tag_name}`)).toBeTruthy();
      expect(await pages.tags.is_tag_important(`${tag_name}`)).toBeTruthy();
    });
  });

  /**
   * /project/1/test-cases/6
   */
  test(`Add several unimportant tags`, async ({ steps: { pages } }) => {
    let tags;
    let tags_all;
    await test.step(`I add one more tag`, async () => {
      await pages.modals.add_tag.add_one_more_tag.click();
      expect(pages.modals.add_tag.is_tag_name_input_visible(0)).toBeTruthy();
      expect(pages.modals.add_tag.is_tag_name_input_visible(1)).toBeTruthy();
    });
    await test.step(`I fill inputs and click 'create' button`, async () => {
      tags = await pages.modals.add_tag.fill_all_tag_name('tag');
      await pages.modals.add_tag.add_new_tag.click();
      tags_all = await pages.tags.get_all_tags();
      await pages.tags.wait_until_tag_visible(tags);
    });
    await test.step(`I check new tags`, async () => {
      expect(await pages.tags.tags_list.is_visible()).toBeTruthy();
      expect(tags_all).toEqual(expect.arrayContaining(tags));
    });
  });

  /**
   * /project/1/test-cases/7
   */
  test(`Add several tags, one important`, async ({ steps: { pages } }) => {
    let tags;
    let tags_all;
    await test.step(`I add one more tag`, async () => {
      await pages.modals.add_tag.add_one_more_tag.click();
      expect(pages.modals.add_tag.is_tag_name_input_visible(0)).toBeTruthy();
      expect(pages.modals.add_tag.is_tag_name_input_visible(1)).toBeTruthy();
    });
    await test.step(`I fill inputs, check 'important' and click 'create' button`, async () => {
      tags = await pages.modals.add_tag.fill_all_tag_name('tag_test');
      await pages.modals.add_tag.check_important(1);
      expect(pages.modals.add_tag.is_checkbox_marked(1)).toBeTruthy();
      await pages.modals.add_tag.add_new_tag.click();
      await pages.tags.wait_until_tag_visible(tags);
      tags_all = await pages.tags.get_all_tags();
    });
    await test.step(`I check new tags`, async () => {
      expect(await pages.tags.tags_list.is_visible()).toBeTruthy();
      expect(tags_all).toEqual(expect.arrayContaining(tags));
      expect(await pages.tags.is_tag_important(`tag_test_1`)).toBeTruthy();
    });
  });

  /**
   * /project/1/test-cases/29
   */
  test(`Add several important tags`, async ({ steps: { pages } }) => {
    let tags;
    let tags_all;
    await test.step(`I add one more tag`, async () => {
      await pages.modals.add_tag.add_one_more_tag.click();
      expect(pages.modals.add_tag.is_tag_name_input_visible(0)).toBeTruthy();
      expect(pages.modals.add_tag.is_tag_name_input_visible(1)).toBeTruthy();
    });
    await test.step(`I fill inputs, check 'important' and click 'create' button`, async () => {
      tags = await pages.modals.add_tag.fill_all_tag_name('new_test');
      await pages.modals.add_tag.check_important(0);
      await pages.modals.add_tag.check_important(1);
      await pages.modals.add_tag.add_new_tag.click();
      await pages.tags.wait_until_tag_visible(tags);
      tags_all = await pages.tags.get_all_tags();
    });
    await test.step(`I check new tags`, async () => {
      expect(await pages.tags.tags_list.is_visible()).toBeTruthy();
      expect(tags_all).toEqual(expect.arrayContaining(tags));
      expect(await pages.tags.is_tag_important(`new_test_0`)).toBeTruthy();
      expect(await pages.tags.is_tag_important(`new_test_1`)).toBeTruthy();
    });
  });
});
