import { expect } from '@playwright/test';
import { test } from '../../config/test-base';

test.describe('Check filters and search', () => {
  test.describe('Check filters', () => {
    test.beforeEach(async ({ steps: { pages }, page }) => {
      await test.step(`I open catalog page`, async () => {
        await page.goto('');
        await pages.topPanel.goToCatalog();
      });
    });
    test('Check filter Datasource', async ({ steps: { pages } }) => {
      await test.step('I click Datasource filter', async () => {
        await pages.catalog.openFilterWithSelect(`Datasource`);
        await pages.catalog.chooseOption('Air_flights');
        expect(await pages.catalog.isVisible('_!+AirFlights')).toBeTruthy();
      });
    });
    test('Check filter Namespace', async ({ steps: { pages } }) => {
      await test.step('I click Namespace filter', async () => {
        await pages.catalog.openFilterWithSelect(`Namespace`);
        await pages.catalog.chooseOption('AQA');
        expect(await pages.catalog.isVisible('737boeing')).toBeTruthy();
      });
    });
    test('Check filter Owner', async ({ steps: { pages } }) => {
      await test.step('I click owner filter', async () => {
        await pages.catalog.openDataEntity('books_aqa');
        await pages.dataEntity.createOwner(
          'firstOwner',
          `No result. Create new owner "firstOwner"`,
          'admin',
          `No result. Create new role "admin"`,
        );
        await pages.topPanel.goToCatalog();
        await pages.catalog.openFilterWithInput(`Owner`);
        await pages.catalog.chooseOption('firstOwner');
        expect(await pages.catalog.isVisible('books_aqa')).toBeTruthy();
        expect(await pages.catalog.checkAmountDataEntityTabAll('1')).toBeTruthy();
      });
    });
    test('Check filter Tag', async ({ steps: { pages } }) => {
      await test.step('I click Tag filer', async () => {
        await pages.catalog.openDataEntity('postcards_aqa');
        await pages.dataEntity.createTag('aqa_tag', `No result. Create new tag "aqa_tag"`);
        await pages.topPanel.goToCatalog();
        await pages.catalog.openFilterWithInput(`Tag`);
        await pages.catalog.chooseOption('aqa');
        expect(await pages.catalog.isVisible('postcards_aqa')).toBeTruthy();
        expect(await pages.catalog.checkAmountDataEntityTabAll('1')).toBeTruthy();
      });
    });
  });
});
