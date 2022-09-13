import {expect} from "@playwright/test";
import { test } from '../../config/test-base';
import { go_to_page } from "../../ui/steps/login";

test.describe(() => {

    test('Delete tag', async ({steps: {pages}, page}) => {
            const tag_name = 'tag_4';
            await test.step('I open Tags page', async () => {
                await go_to_page(page, 'http://localhost:8080/');
                await pages.top_panel.go_to_management();
                await pages.management.tags.click();
            });
            await test.step('I create tag', async () => {
                await pages.tags.add_tag(`${tag_name}`);
            });
            await test.step('I click on "Delete" button', async () => {
                await pages.tags.open_delete_modal(`${tag_name}`);
                expect(await pages.modals.delete_tag.is_opened()).toBeTruthy()
            })
            await test.step('I delete tag', async () => {
                await pages.modals.delete_tag.delete_tag_confirm.click();
                expect(await pages.tags.is_tag_visible(`${tag_name}`)).toBeFalsy();
            })

        })
    })