import { expect } from '@playwright/test';
import { test } from '../../config/test-base';

const CONSTANTS = {
  datasourceFilter: 'Datasource',
  namespaceFilter: 'Namespace',
  ownerFilter: 'Owner',
  typeFilter: 'Type',
  tagFilter: 'Tag',
  groupsFilter: 'Groups',
  datasourceOptionAirFlights: 'Air_flights',
  datasourceOptionBookETL: 'Bookshop ETL',
  namespaceOption: 'ETL',
  airFlightsDataEntity: '_!+AirFlights',
  bookETLDataEntity: 'BookETL',
  bookETLDataAQAEntity: 'Book_ETL_aqa',
  kdsClickstreamDataEntity: 'kds_clickstream_consumer',
  postcardsAQADataEntity: 'postcards_aqa',
  tagFilterOption: 'aqa_tag',
  groupsOption: 'group_bookshop',
  transformersTag: 'Transformers',
  firstOwner: 'firstOwner',
  role: 'admin',
  noResultsOwnerText: 'No result. Create new owner "firstOwner"',
  noResultsTitleText: 'No result. Create new title "admin"',
  noResultsTagText: 'No result. Create new tag "aqa_tag"',
};

test.describe('Check filters', () => {
  test.describe('when apply single filter', () => {
    test.beforeEach(async ({ steps: { pages }, page }) => {
      await test.step(`I open catalog page`, async () => {
        await page.goto('');
        await pages.topPanel.clickTab('Catalog');
      });
    });
    /**
     * /project/1/test-cases/23
     */
    test('should display the expected item with Datasource filter', async ({
      steps: { pages },
    }) => {
      await test.step('apply filter Datasource', async () => {
        await pages.catalog.openFilterWithSelect(CONSTANTS.datasourceFilter);
        await pages.catalog.chooseOption(CONSTANTS.datasourceOptionAirFlights);
        expect(await pages.catalog.isListItemVisible(CONSTANTS.airFlightsDataEntity)).toBeTruthy();
      });
    });
    /**
     * /project/1/test-cases/24
     */
    test('should display the expected item with Namespace filter', async ({ steps: { pages } }) => {
      await test.step('apply filter Namespace', async () => {
        await pages.catalog.openFilterWithSelect(CONSTANTS.namespaceFilter);
        await pages.catalog.chooseOption(CONSTANTS.namespaceOption);
        expect(await pages.catalog.isListItemVisible(CONSTANTS.airFlightsDataEntity)).toBeTruthy();
        expect(await pages.catalog.isListItemVisible(CONSTANTS.bookETLDataEntity)).toBeTruthy();
        expect(await pages.catalog.isListItemVisible(CONSTANTS.bookETLDataAQAEntity)).toBeTruthy();
        expect(
          await pages.catalog.isListItemVisible(CONSTANTS.kdsClickstreamDataEntity),
        ).toBeTruthy();
      });
    });
    /**
     * /project/1/test-cases/25
     */
    test('should display the expected item with Owner filter', async ({ steps: { pages } }) => {
      await test.step('apply filter Owner', async () => {
        await pages.catalog.searchByText(CONSTANTS.bookETLDataEntity);
        await pages.catalog.clickOnListItem(CONSTANTS.bookETLDataEntity);
        await pages.overview.createOwner(
          CONSTANTS.firstOwner,
          CONSTANTS.noResultsOwnerText,
          CONSTANTS.role,
          CONSTANTS.noResultsTitleText,
        );
        await pages.topPanel.clickTab('Catalog');
        await pages.catalog.searchByTextInFilter('Owner', 'firstOwner');
        expect(await pages.catalog.isListItemVisible(CONSTANTS.bookETLDataEntity)).toBeTruthy();
      });
    });
    /**
     * /project/1/test-cases/26
     */
    test('should display the expected item with Tag filter', async ({ steps: { pages } }) => {
      await test.step('apply filter Tag', async () => {
        await pages.catalog.searchByText(CONSTANTS.bookETLDataEntity);
        await pages.catalog.clickOnListItem(CONSTANTS.bookETLDataEntity);
        await pages.overview.createTag(CONSTANTS.tagFilterOption, CONSTANTS.noResultsTagText);
        await pages.topPanel.clickTab('Catalog');
        await pages.catalog.searchByTextInFilter('Tag', 'aqa_tag');
        expect(await pages.catalog.isListItemVisible(CONSTANTS.bookETLDataEntity)).toBeTruthy();
      });
    });
    /**
     * /project/1/test-cases/70
     */
    test('should display the expected item with Type filter', async ({ steps: { pages } }) => {
      await test.step('I go to the Transformers tab', async () => {
        await pages.catalog.clickTab(CONSTANTS.transformersTag);
      });
      await test.step('apply filter Type', async () => {
        await pages.catalog.openFilterWithInput(CONSTANTS.typeFilter);
        await pages.catalog.searchByTextInFilter('Type', 'JOB');
        expect(await pages.catalog.isListItemVisible(CONSTANTS.bookETLDataEntity)).toBeTruthy();
      });
    });
    /**
     * /project/1/test-cases/71
     */
    test('should display the expected item with Group filter', async ({ steps: { pages } }) => {
      await test.step('apply filter Group', async () => {
        await pages.catalog.openFilterWithInput(CONSTANTS.groupsFilter);
        await pages.catalog.chooseOption(CONSTANTS.groupsOption);
        expect(
          await pages.catalog.isListItemVisible(CONSTANTS.postcardsAQADataEntity),
        ).toBeTruthy();
        expect(await pages.catalog.isListItemVisible(CONSTANTS.bookETLDataEntity)).toBeTruthy();
      });
    });
    test.describe('when apply multiply filter', () => {
      test.beforeEach(async ({ steps: { pages }, page }) => {
        await test.step(`I open catalog page`, async () => {
          await page.goto('');
          await pages.topPanel.clickTab('Catalog');
        });
      });
      /**
       * /project/1/test-cases/28
       */
      test('should display the expected item with different types of filters', async ({
        steps: { pages },
      }) => {
        await test.step('apply filter Tag', async () => {
          await pages.catalog.openFilterWithSelect(CONSTANTS.namespaceFilter);
          await pages.catalog.chooseOption(CONSTANTS.namespaceOption);
          expect(await pages.catalog.isListItemVisible(CONSTANTS.bookETLDataEntity)).toBeTruthy();
          expect(
            await pages.catalog.isListItemVisible(CONSTANTS.bookETLDataAQAEntity),
          ).toBeTruthy();
        });
        await test.step('apply filter Owner', async () => {
          await pages.catalog.openFilterWithInput(CONSTANTS.ownerFilter);
          await pages.catalog.chooseOption(CONSTANTS.firstOwner);
          expect(await pages.catalog.isListItemVisible(CONSTANTS.bookETLDataEntity)).toBeTruthy();
        });
      });
      /**
       * /project/1/test-cases/28
       */
      test('should display the expected item with all filters', async ({ steps: { pages } }) => {
        await test.step('apply filter Datasource', async () => {
          await pages.catalog.openFilterWithSelect(CONSTANTS.datasourceFilter);
          await pages.catalog.chooseOption(CONSTANTS.datasourceOptionBookETL);
        });
        await test.step('apply filter Namespace', async () => {
          await pages.catalog.openFilterWithSelect(CONSTANTS.namespaceFilter);
          await pages.catalog.chooseOption(CONSTANTS.namespaceOption);
        });
        await test.step('apply filter Tag', async () => {
          await pages.catalog.openFilterWithInput(CONSTANTS.tagFilter);
          await pages.catalog.chooseOption(CONSTANTS.tagFilterOption);
        });
        await test.step('apply filter Group', async () => {
          await pages.catalog.openFilterWithInput(CONSTANTS.groupsFilter);
          await pages.catalog.chooseOption(CONSTANTS.groupsOption);
          expect(await pages.catalog.isListItemVisible(CONSTANTS.bookETLDataEntity)).toBeTruthy();
        });
      });
    });
  });
});
