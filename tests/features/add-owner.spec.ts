import { expect } from '@playwright/test';
import { test } from '../config/test-base';
import { go_to_page } from '../ui/steps/login';

test.describe.only('Owners', function () {
  test('Add new Owner', async ({ steps: { pages }, page }) => {
    const owner_name = 'Test_owner_name';

    await test.step('I open Owners page', async () => {
      await go_to_page(page, 'http://localhost:8080/');
      await pages.top_panel.go_to_management();
      await pages.management.owners.click();
    });
    await test.step("And click on 'Create Owner' button", async () => {
      await pages.owners.create_owner.click();
      expect(await pages.modals.add_owner.is_opened()).toBeTruthy();
    });
    await test.step(`I fill owner name ${owner_name} and click \'create\' button.`, async () => {
      await pages.modals.add_owner.owner_name_field.fill(`${owner_name}`);
      await pages.modals.add_owner.add_new_owner.click();
    });
    await test.step(`Then owner name ${owner_name} present on the page`, async () => {
        expect(await pages.owners.owners_list.is_visible()).toBeTruthy();
    });
  });
});
