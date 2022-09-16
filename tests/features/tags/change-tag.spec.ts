import {expect} from "@playwright/test";
import { test } from '../../config/test-base';

test.describe(() => {
    test.beforeEach(async ({ steps: { pages }, page}) => {
        await test.step(`I open Tags page`, async () => {
            await page.goto('');
            await pages.top_panel.go_to_management();
            await pages.management.tags.click();
        });
    });
    test(`Change tag name`, async ({ steps: { pages }, page }) => {
        /**
        https://odd.testops.cloud/project/1/test-cases/30?treeId=0
         */
        const tag_name = 'tag_1';
        const changed_name = 'tag_changed_name';
        await test.step(`I create tag`, async () => {
            await pages.tags.add_tag(tag_name);
        });
        await test.step(`I click on "Edit" button`, async () => {
            await pages.tags.edit_tag(`${tag_name}`);
            expect(await pages.modals.edit_tag.is_opened()).toBeTruthy();
        });
        await test.step(`I change name of the tag and click 'save' button`, async () => {
            await pages.modals.edit_tag.tag_name_field.fill(`${changed_name}`);
            await pages.modals.edit_tag.save_tag.click();
        });
        await test.step(`Then tag name ${changed_name} present on the page`, async () => {
            expect(await pages.tags.is_tag_visible(`${tag_name}`)).toBeTruthy();
        });
    });
    test(`Mark tag as important`, async ({ steps: { pages }, page }) => {
        /**
        https://odd.testops.cloud/project/1/test-cases/31?treeId=0
         */
        const tag_name = 'tag_2';
        await test.step(`I create tag`, async () => {
            await pages.tags.add_tag(tag_name);
        });
        await test.step(`I click on 'Edit' button`, async () => {
            await pages.tags.edit_tag(`${tag_name}`);
            expect(await pages.modals.edit_tag.is_opened()).toBeTruthy();
        });
        await test.step(`I mark checkbox 'important' and click 'Save' button`, async () => {
            await pages.modals.edit_tag.check_important.click();
            await pages.modals.edit_tag.save_tag.click();
            expect(await pages.tags.is_tag_visible(`${tag_name}`)).toBeTruthy();
            expect(await pages.tags.is_tag_important(`${tag_name}`)).toBeTruthy();
        });
    });
    test(`Mark tag as unimportant`, async ({ steps: { pages }, page }) => {
        /**
        https://odd.testops.cloud/project/1/test-cases/32?treeId=0
         */
        const tag_name = 'tag_3';
        await test.step(`I create tag`, async () => {
            await pages.tags.add_important_tag(tag_name);
        });
        await test.step(`I click on 'Edit' button`, async () => {
            await pages.tags.edit_tag(`${tag_name}`);
            expect(await pages.modals.edit_tag.is_opened()).toBeTruthy();
        });
        await test.step(`I uncheck checkbox 'important' and click 'Save' button`, async () => {
            await pages.modals.edit_tag.check_important.click();
            await pages.modals.edit_tag.save_tag.click();
            expect(await pages.tags.is_tag_visible(`${tag_name}`)).toBeTruthy();
            expect(await pages.tags.is_tag_important(`${tag_name}`)).toBeFalsy();
        });
    });
});