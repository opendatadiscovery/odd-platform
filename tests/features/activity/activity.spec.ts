import { expect } from '@playwright/test';
import { test } from '../../config/test-base';

const entityNameWithAlphabeticChars = 'Book_ETL_aqa';

test.describe('Check filters', () => {
  test.describe('When apply single filter', () => {
    test.beforeEach(async ({ steps: { pages }, page }) => {
      await test.step(`I open activity page`, async () => {
        await page.goto('');
        await pages.topPanel.clickTab('Activity');
      });
    });
    /**
     * /project/1/test-cases/139
     * /project/1/test-cases/141
     * /project/1/test-cases/142
     */
    const parameters = [
      { testName: 'Event type', filterName: 'Event type', inputValue: 'Data Entity Created' },
      { testName: 'Datasource', filterName: 'Datasource', inputValue: 'Book_ETL_aqa' },
      { testName: 'Namespace', filterName: 'Namespace', inputValue: 'ETL' },
    ];
    parameters.forEach(parameter => {
      test(`Display an expected item with filter ${parameter.testName}`, async ({
        steps: { pages },
      }) => {
        await test.step(`When apply filter ${parameter.testName}`, async () => {
          await pages.activity.openFilterWithSelect(parameter.filterName);
          await pages.activity.chooseOption(parameter.inputValue);
          expect(
            await pages.activity.countListItems(entityNameWithAlphabeticChars),
          ).toBeGreaterThanOrEqual(1);
        });
      });
    });
    /**
     * /project/1/test-cases/143
     */
    test(`Display an expected item with filter Tag`, async ({ steps: { pages } }) => {
      await test.step(`When apply filter Tag`, async () => {
        await pages.activity.tagFilter.set('aqa');
        expect(
          await pages.activity.countListItems(entityNameWithAlphabeticChars),
        ).toBeGreaterThanOrEqual(1);
      });
    });
    /**
     * /project/1/test-cases/144
     */
    test(`Display an expected item with filter Owner`, async ({ workerId, steps: { pages } }) => {
      const ownerName7 = `ownerName7${workerId}`;
      const ownerTitle7 = `ownerTitle7${workerId}`;
      await test.step(`When apply filter Owner`, async () => {
        await pages.topPanel.clickTab('Catalog');
        await pages.catalog.searchBy(entityNameWithAlphabeticChars);
        await pages.catalog.clickOnListItem(entityNameWithAlphabeticChars);
        await pages.overview.createOwner(ownerName7, ownerTitle7);
        await pages.topPanel.clickTab('Activity');
        await pages.activity.ownerFilter.set(ownerName7);
        expect(
          await pages.activity.countListItems(entityNameWithAlphabeticChars),
        ).toBeGreaterThanOrEqual(1);
      });
    });
    /**
     * /project/1/test-cases/138
     */
    test(`Display an expected item with filter Period`, async ({ steps: { pages } }) => {
      await test.step(`When apply filter Period`, async () => {
        await pages.activity.choose3days(`Period`);
        expect(await pages.activity.isAlertVisible()).toBeTruthy();
      });
    });
  });
});
