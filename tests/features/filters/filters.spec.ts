import { expect } from '@playwright/test';
import { test } from '../../config/test-base';

const datasourceFilter = 'Datasource';
const namespaceFilter = 'Namespace';
const ownerFilter = 'Owner';
const typeFilter = 'Type';
const tagFilter = 'Tag';
const groupsFilter = 'Groups';
const datasourceOptionBookETL = 'Book_ETL_aqa';
const namespaceOption = 'ETL';
const bookETLDataEntity = 'Book_ETL_aqa';
const tagFilterOption = 'aqa';
const groupsOption = 'group_bookshop';
const transformersTab = 'Transformers';

test.describe('Check filters', () => {
  test.describe('When apply single filter', () => {
    test.beforeEach(async ({ steps: { pages }, page }) => {
      await test.step(`I open catalog page`, async () => {
        await page.goto('');
        await pages.topPanel.clickTab('Catalog');
      });
    });
    /**
     * /project/1/test-cases/23
     */
    test('Should display the expected item with Datasource filter', async ({
      steps: { pages },
    }) => {
      await test.step('Apply filter Datasource', async () => {
        await pages.catalog.openFilterWithSelect(datasourceFilter);
        await pages.catalog.chooseOption(datasourceOptionBookETL);
        expect(await pages.catalog.isListItemVisible(bookETLDataEntity)).toBeTruthy();
      });
    });
    /**
     * /project/1/test-cases/24
     */
    test('Should display the expected item with Namespace filter', async ({ steps: { pages } }) => {
      await test.step('Apply filter Namespace', async () => {
        await pages.catalog.openFilterWithSelect(namespaceFilter);
        await pages.catalog.chooseOption(namespaceOption);
        expect(await pages.catalog.isListItemVisible(bookETLDataEntity)).toBeTruthy();
      });
    });
    /**
     * /project/1/test-cases/25
     */
    test('Should display the expected item with Owner filter', async ({
      workerId,
      steps: { pages },
    }) => {
      const ownerName1 = `ownerName1${workerId}`;
      const ownerTitle1 = `ownerTitle1${workerId}`;

      await test.step('Apply filter Owner', async () => {
        await pages.catalog.searchBy(bookETLDataEntity);
        await pages.catalog.clickOnListItem(bookETLDataEntity);
        await pages.overview.createOwner(ownerName1, ownerTitle1);
        await pages.topPanel.clickTab('Catalog');
        await pages.catalog.searchByTextInFilter(ownerFilter, ownerName1);
        expect(await pages.catalog.isListItemVisible(bookETLDataEntity)).toBeTruthy();
      });
    });
    /**
     * /project/1/test-cases/26
     */
    test('Should display the expected item with Tag filter', async ({ steps: { pages } }) => {
      await test.step('Apply filter Tag', async () => {
        await pages.catalog.searchByTextInFilter(tagFilter, tagFilterOption);
        expect(await pages.catalog.isListItemVisible(bookETLDataEntity)).toBeTruthy();
      });
    });
    /**
     * /project/1/test-cases/70
     */
    test('Should display the expected item with Type filter', async ({ steps: { pages } }) => {
      await test.step('Go to the Transformers tab', async () => {
        await pages.catalog.clickTab(transformersTab);
      });
      await test.step('Apply filter Type', async () => {
        await pages.catalog.openFilterWithInput(typeFilter);
        await pages.catalog.searchByTextInFilter('Type', 'VIEW');
        expect(await pages.catalog.isListItemVisible(bookETLDataEntity)).toBeTruthy();
      });
    });
    /**
     * /project/1/test-cases/71
     */
    test('Should display the expected item with Group filter', async ({ steps: { pages } }) => {
      await test.step('Apply filter Group', async () => {
        await pages.catalog.openFilterWithInput(groupsFilter);
        await pages.catalog.chooseOption(groupsOption);
        expect(await pages.catalog.isListItemVisible(bookETLDataEntity)).toBeTruthy();
      });
    });
  });
  test.describe('Apply multiple filters', () => {
    test.beforeEach(async ({ steps: { pages }, page }) => {
      await test.step(`I open catalog page`, async () => {
        await page.goto('');
        await pages.topPanel.clickTab('Catalog');
      });
    });
    /**
     * /project/1/test-cases/28
     */
    test('Should display the expected item with different types of filters', async ({
      workerId,
      steps: { pages },
    }) => {
      const ownerName2 = `ownerName2${workerId}`;
      const ownerTitle2 = `ownerTitle2${workerId}`;
      await test.step('Apply filter Namespace', async () => {
        await pages.catalog.openFilterWithSelect(namespaceFilter);
        await pages.catalog.chooseOption(namespaceOption);
        expect(await pages.catalog.isListItemVisible(bookETLDataEntity)).toBeTruthy();
      });
      await test.step('Apply filter Owner', async () => {
        await pages.catalog.searchBy(bookETLDataEntity);
        await pages.catalog.clickOnListItem(bookETLDataEntity);
        await pages.overview.createOwner(ownerName2, ownerTitle2);
        await pages.topPanel.clickTab('Catalog');
        await pages.catalog.searchByTextInFilter(ownerFilter, ownerName2);

        expect(await pages.catalog.isListItemVisible(bookETLDataEntity)).toBeTruthy();
      });
    });
    /**
     * /project/1/test-cases/103
     */
    test('Should display the expected item with all filters', async ({
      workerId,
      steps: { pages },
    }) => {
      const ownerName3 = `ownerName3${workerId}`;
      const ownerTitle3 = `ownerTitle3${workerId}`;
      await test.step('Apply filter Datasource', async () => {
        await pages.catalog.openFilterWithSelect(datasourceFilter);
        await pages.catalog.chooseOption(datasourceOptionBookETL);
      });
      await test.step('Apply filter Namespace', async () => {
        await pages.catalog.openFilterWithSelect(namespaceFilter);
        await pages.catalog.chooseOption(namespaceOption);
      });
      await test.step('Apply filter Owner', async () => {
        await pages.catalog.searchBy(bookETLDataEntity);
        await pages.catalog.clickOnListItem(bookETLDataEntity);
        await pages.overview.createOwner(ownerName3, ownerTitle3);
        await pages.topPanel.clickTab('Catalog');
        await pages.catalog.searchByTextInFilter(ownerFilter, ownerName3);
      });
      await test.step('Apply filter Tag', async () => {
        await pages.catalog.searchByTextInFilter(tagFilter, tagFilterOption);
      });
      await test.step('Apply filter Group', async () => {
        await pages.catalog.searchByTextInFilter(groupsFilter, groupsOption);
        expect(await pages.catalog.isListItemVisible(bookETLDataEntity)).toBeTruthy();
      });
    });
  });
});
