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
    test(`Delete unimportant tag`, async ({ steps: { pages } }) => {
        /**
        /project/1/test-cases/33?treeId=0
         */
        const tag_name = 'tag_4';
        await test.step(`I create tag`, async () => {
            await pages.tags.add_tag(`${tag_name}`);
        });
        await test.step(`I click on 'Delete' button`, async () => {
            await pages.tags.open_delete_modal(`${tag_name}`);
            expect(await pages.modals.delete_tag.is_opened()).toBeTruthy()
            });
        await test.step(`I delete tag`, async () => {
            await pages.modals.delete_tag.delete_tag_confirm.click();
            await pages.tags.wait_until_tag_invisible(tag_name);
            expect(await pages.tags.is_tag_invisible(`${tag_name}`)).toBeTruthy();
            });
        });
    test(`Delete important tag`, async ({ steps: { pages } }) => {
        /**
        /project/1/test-cases/34?treeId=0
         */
        const tag_name = 'tag_5';
        await test.step(`I create tag`, async () => {
            await pages.tags.add_important_tag(`${tag_name}`);
        });
        await test.step(`I click on 'Delete' button`, async () => {
            await pages.tags.open_delete_modal(`${tag_name}`);
            expect(await pages.modals.delete_tag.is_opened()).toBeTruthy()
        });
        await test.step(`I delete tag`, async () => {
            await pages.modals.delete_tag.delete_tag_confirm.click();
            await pages.tags.wait_until_tag_invisible(tag_name);
            expect(await pages.tags.is_tag_invisible(tag_name)).toBeTruthy();
        });
    });
});