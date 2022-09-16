import { expect} from "@playwright/test";
import { test } from '../../config/test-base';

test.describe('Tags', function () {
    let tags_all;
    let tag_name;
    test.beforeEach(async ({ steps: { pages }, page}) => {
        await test.step(`I open Tags page`, async () => {
            await page.goto('');
            await pages.top_panel.go_to_management();
            await pages.management.tags.click();
        })
        await test.step(`And Click on 'Create Tag' button`, async () => {
            await pages.tags.create_tag.click();
            expect(await pages.modals.add_tag.is_opened()).toBeTruthy();
        });
    });
    test(`Add new Tag`, async ({ steps: { pages }, page}) => {
        /**
        https://odd.testops.cloud/project/1/test-cases/4?treeId=0
        */
        tag_name = 'Test_tag_name';
        await test.step(`I fill tag name ${tag_name} and click 'create' button`, async () => {
            await pages.modals.add_tag.tag_name_field.fill(`${tag_name}`);
            await pages.modals.add_tag.add_new_tag.click();
        });
        await test.step(`Then tag name ${tag_name} present on the page`, async () => {
            expect(await pages.tags.is_tag_visible(`${tag_name}`)).toBeTruthy();
        });
    });
    test(`Add new important tag`, async ({ steps: {pages }, page }) => {
        /**
        https://odd.testops.cloud/project/1/test-cases/5?treeId=0
        */
        tag_name = 'Test_important_tag_name';
        await test.step(`I fill tag name ${tag_name}`, async () => {
            await pages.modals.add_tag.tag_name_field.fill(`${tag_name}`);
        });
        await test.step(`I mark checkbox 'important'`, async () => {
            await pages.modals.add_tag.check_important(0);
            await expect(await page.locator('[type="checkbox"]').inputValue()).toBeTruthy();
        });
        await test.step(`I click 'create' button`, async () => {
            await pages.modals.add_tag.add_new_tag.click();
            expect(await pages.tags.is_tag_visible(`${tag_name}`)).toBeTruthy();
            expect(await pages.tags.is_tag_important(`${tag_name}`)).toBeTruthy();
        });
    });
    test(`Add several unimportant tags`, async ({ steps: { pages }, page }) => {
        /**
        https://odd.testops.cloud/project/1/test-cases/6?treeId=0
        */
        await test.step(`I add one more tag`, async () => {
            await pages.modals.add_tag.add_one_more_tag.click();
            await expect(await page.locator('[placeholder="Tag Name"]').nth(1).isVisible()).toBeTruthy();
        });
        await test.step(`I fill inputs and click 'create' button`, async () => {
            const tags = await pages.modals.add_tag.fill_all_tag_name('tag');
            await pages.modals.add_tag.add_new_tag.click();
            tags_all = await pages.tags.get_all_tags();
            expect(await pages.tags.tags_list.is_visible()).toBeTruthy();
            expect(tags_all).toEqual(expect.arrayContaining(tags))
        });
    });
    test(`Add several tags, one important`, async ({ steps: {pages }, page }) => {
        /**
        https://odd.testops.cloud/project/1/test-cases/7?treeId=0
        */
        await test.step(`I add one more tag`, async () => {
            await pages.modals.add_tag.add_one_more_tag.click();
            await expect(await page.locator('[placeholder="Tag Name"]').nth(1).isVisible()).toBeTruthy();
        });
        await test.step(`I fill inputs, check 'important' and click 'create' button`, async () => {
            const tags = await pages.modals.add_tag.fill_all_tag_name('tag_test');
            await pages.modals.add_tag.check_important(1);
            await expect(await page.locator('[type="checkbox"]').nth(1).inputValue()).toBeTruthy();
            await pages.modals.add_tag.add_new_tag.click();
            tags_all = await pages.tags.get_all_tags();
            expect(await pages.tags.tags_list.is_visible()).toBeTruthy();
            expect(tags_all).toEqual(expect.arrayContaining(tags))
            expect(await pages.tags.is_tag_important(`tag_test_1`)).toBeTruthy();
        });
    });
    test(`Add several important tags`, async ({ steps: { pages }, page }) => {
        /**
        https://odd.testops.cloud/project/1/test-cases/29?treeId=0
         */
        await test.step(`I add one more tag`, async () => {
            await pages.modals.add_tag.add_one_more_tag.click();
            await expect(await page.locator('[placeholder="Tag Name"]').nth(1).isVisible()).toBeTruthy();
        });
        await test.step(`I fill inputs, check 'important' and click 'create' button`, async () => {
            const tags = await pages.modals.add_tag.fill_all_tag_name('new_test');
            await pages.modals.add_tag.check_important(0);
            await pages.modals.add_tag.check_important(1);
            await pages.modals.add_tag.add_new_tag.click();
            tags_all = await pages.tags.get_all_tags();
            expect(await pages.tags.tags_list.is_visible()).toBeTruthy();
            expect(tags_all).toEqual(expect.arrayContaining(tags))
            expect(await pages.tags.is_tag_important(`new_test_0`)).toBeTruthy();
            expect(await pages.tags.is_tag_important(`new_test_1`)).toBeTruthy();
        });
    });
});
