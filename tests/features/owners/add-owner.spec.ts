import { expect } from '@playwright/test';
import { test } from '../../config/test-base';

test.describe('Owners', () => {
  test.beforeEach(async ({ steps: { pages }, page }) => {
    await test.step(`I open Owners page`, async () => {
      await page.goto('');
      await pages.topPanel.clickTab('Management');
      await pages.management.owners.click();
    });
    await test.step(`And Click on 'Create owner' button`, async () => {
      await pages.owners.createOwner.click();
      expect(await pages.modals.addOwner.isOpened()).toBeTruthy();
    });
  });
  /**
   * /project/1/test-cases/1
   */
  test('Add new Owner', async ({ workerId, steps: { pages }, page }) => {
    const ownerName = `Test_ownerName + ${workerId}`;
    await test.step(`I fill owner name ${ownerName} and click 'create' button.`, async () => {
      await pages.modals.addOwner.ownerNameField.fill(`${ownerName}`);
      await pages.modals.addOwner.addNewOwner.click();
    });
    await test.step(`Then owner name ${ownerName} present on the page`, async () => {
      expect(await pages.owners.ownersList.isVisible()).toBeTruthy();
    });
  });
  /**
   * /project/1/test-cases/2
   */
  test(`Cleanup input in popup window Owners`, async ({ workerId, steps: { pages } }) => {
    const ownerName = `Test_ownerName + ${workerId}`;
    await test.step(`I fill owner name ${ownerName} and click 'create' button.`, async () => {
      await pages.modals.addOwner.ownerNameField.fill(`${ownerName}`);
    });
    await test.step(`I clean the input`, async () => {
      await pages.modals.addOwner.ownerNameCleanButton.click();
      expect(await pages.modals.addOwner.ownerNameField.innerText()).toEqual('');
      expect(await pages.modals.addOwner.addNewOwner.isDisabled()).toBeTruthy();
    });
  });
  /**
   * /project/1/test-cases/3
   */
  test(`Close the popup window Add owner`, async ({ steps: { pages } }) => {
    await test.step(`I close the popup`, async () => {
      await pages.modals.addOwner.closeDialog.click();
      expect(await pages.modals.addOwner.dialogTitle.isHidden()).toBeTruthy();
    });
  });
});
