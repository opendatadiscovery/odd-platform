import { expect } from '@playwright/test';
import { test } from '../../config/test-base';

test.describe('Owners', () => {
  test('Add new Owner', async ({workerId, steps: { pages }, page }) => {
    const ownerName = `Test_ownerName + ${workerId}`;

    await test.step('I open Owners page', async () => {
      await page.goto('');
      await pages.topPanel.clickTab('Management');
      await pages.management.owners.click();
    });
    await test.step("And click on 'Create Owner' button", async () => {
      await pages.owners.createOwner.click();
      expect(await pages.modals.addOwner.isOpened()).toBeTruthy();
    });
    await test.step(`I fill owner name ${ownerName} and click 'create' button.`, async () => {
      await pages.modals.addOwner.ownerNameField.fill(`${ownerName}`);
      await pages.modals.addOwner.addNewOwner.click();
    });
    await test.step(`Then owner name ${ownerName} present on the page`, async () => {
      expect(await pages.owners.ownersList.isVisible()).toBeTruthy();
    });
  });
});
