import { expect } from "@playwright/test";
import { test } from '../../config/test-base';
import { go_to_page } from "../../ui/steps/login";

test.describe('Tags', function () {
    let tags_all;
    let tag_name;

    test('Add new Tag', async ({steps: {pages}, page}) => {
        tag_name = 'Test_tag_name';

        await test.step('I open Tags page', async () => {
            await go_to_page(page, 'http://localhost:8080/');
            await pages.top_panel.go_to_management();
            await pages.management.tags.click();
        });
        await test.step('And Click on "Create Tag" button', async () => {
            await pages.tags.create_tag.click();
            expect(await pages.modals.add_tag.is_opened()).toBeTruthy();
        });
        await test.step(`I fill tag name ${tag_name} and click \'create\' button`, async () => {
            await pages.modals.add_tag.tag_name_field.fill(`${tag_name}`);
            await pages.modals.add_tag.add_new_tag.click();
        })
        await test.step(`Then tag name ${tag_name} present on the page`, async () => {
            expect(await pages.tags.is_tag_visible(`${tag_name}`)).toBeTruthy();
        })
    })

    test('Add new important tag', async ({steps: {pages}, page}) => {
        tag_name = 'Test_important_tag_name';

        await test.step('I open Tags page', async () => {
            await go_to_page(page, 'http://localhost:8080/');
            await pages.top_panel.go_to_management();
            await pages.management.tags.click();
        });
        await test.step('And Click on "Create Tag" button', async () => {
            await pages.tags.create_tag.click();
            expect(await pages.modals.add_tag.is_opened()).toBeTruthy();
        });
        await test.step(`I fill tag name ${tag_name}`, async () => {
            await pages.modals.add_tag.tag_name_field.fill(`${tag_name}`);
        })
        await test.step('I mark checkbox \'important\'', async () => {
            await pages.modals.add_tag.check_important(0);
        })
        await test.step('I click \'create\' button', async () => {
            await pages.modals.add_tag.add_new_tag.click();
            expect(await pages.tags.is_tag_visible(`${tag_name}`)).toBeTruthy();
            expect(await pages.tags.is_tag_important(`${tag_name}`)).toBeTruthy();
        })
    })

    test('Add several unimportant tags', async ({steps: {pages}, page}) => {
        await test.step('I open Tags page', async () => {
            await go_to_page(page, 'http://localhost:8080/');
            await pages.top_panel.go_to_management();
            await pages.management.tags.click();
        });
        await test.step('And Click on "Create Tag" button', async () => {
            await pages.tags.create_tag.click();
            expect(await pages.modals.add_tag.is_opened()).toBeTruthy();
        });
        await test.step('I add one more tag', async () => {
            await pages.modals.add_tag.add_one_more_tag.click();
        })
        await test.step(`I fill inputs and click \'create\' button`, async () => {
            const tags = await pages.modals.add_tag.fill_all_tag_name('tag');
            await pages.modals.add_tag.add_new_tag.click();
            tags_all = await pages.tags.get_all_tags();
            expect(await pages.tags.tags_list.is_visible()).toBeTruthy();
            const is_contain = tags_all.some(array => tags.includes(array));
            expect(is_contain).toBeTruthy();
        })
    })

    test('Add several tags, one important', async ({steps: {pages}, page}) => {
        await test.step('I open Tags page', async () => {
            await go_to_page(page, 'http://localhost:8080/');
            await pages.top_panel.go_to_management();
            await pages.management.tags.click();
        });
        await test.step('And Click on "Create Tag" button', async () => {
            await pages.tags.create_tag.click();
            expect(await pages.modals.add_tag.is_opened()).toBeTruthy();
        });
        await test.step('I add one more tag', async () => {
            await pages.modals.add_tag.add_one_more_tag.click();
        })
        await test.step(`I fill inputs, check 'important' and click 'create' button`, async () => {
            const tags = await pages.modals.add_tag.fill_all_tag_name('tag_test');
            await pages.modals.add_tag.check_important(1);
            await pages.modals.add_tag.add_new_tag.click();
            tags_all = await pages.tags.get_all_tags();
            expect(await pages.tags.tags_list.is_visible()).toBeTruthy();
            const is_contain = tags_all.some(array => tags.includes(array));
            expect(is_contain).toBeTruthy();
            expect(await pages.tags.is_tag_important(`tag_test_1`)).toBeTruthy();

        })
    })

    test('Add several important tags', async ({steps: {pages}, page}) => {
        await test.step('I open Tags page', async () => {
            await go_to_page(page, 'http://localhost:8080/');
            await pages.top_panel.go_to_management();
            await pages.management.tags.click();
        });
        await test.step('And Click on "Create Tag" button', async () => {
            await pages.tags.create_tag.click();
            expect(await pages.modals.add_tag.is_opened()).toBeTruthy();
        });
        await test.step('I add one more tag', async () => {
            await pages.modals.add_tag.add_one_more_tag.click();
        })
        await test.step(`I fill inputs, check 'important' and click 'create' button`, async () => {
            const tags = await pages.modals.add_tag.fill_all_tag_name('new_test');
            await pages.modals.add_tag.check_important(0);
            await pages.modals.add_tag.check_important(1);
            await pages.modals.add_tag.add_new_tag.click();
            tags_all = await pages.tags.get_all_tags();
            expect(await pages.tags.tags_list.is_visible()).toBeTruthy();
            const is_contain = tags_all.some(array => tags.includes(array));
            expect(is_contain).toBeTruthy();
            expect(await pages.tags.is_tag_important(`new_test_0`)).toBeTruthy();
            expect(await pages.tags.is_tag_important(`new_test_1`)).toBeTruthy();

        })
    })
})

