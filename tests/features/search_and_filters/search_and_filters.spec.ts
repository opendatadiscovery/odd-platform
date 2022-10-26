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
  test.describe('Apply single filter', () => {
    test.beforeEach(async ({ steps: { pages }, page }) => {
      await test.step(`I open catalog page`, async () => {
        await page.goto('');
        await pages.topPanel.goToCatalog();
      });
    });
    test('Check filter Datasource', async ({ steps: { pages } }) => {
      await test.step('I click Datasource filter', async () => {
        await pages.catalog.openFilterWithSelect(CONSTANTS.datasourceFilter);
        await pages.catalog.chooseOption(CONSTANTS.datasourceOptionAirFlights);
        expect(await pages.catalog.isListItemVisible(CONSTANTS.airFlightsDataEntity)).toBeTruthy();
      });
    });
    test('Check filter Namespace', async ({ steps: { pages } }) => {
      await test.step('I click Namespace filter', async () => {
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
    test('Check filter Owner', async ({ steps: { pages } }) => {
      await test.step('I click owner filter', async () => {
        await pages.catalog.searchByText(CONSTANTS.bookETLDataEntity);
        await pages.catalog.clickOnListItem(CONSTANTS.bookETLDataEntity);
        await pages.dataEntity.createOwner(
          CONSTANTS.firstOwner,
          CONSTANTS.noResultsOwnerText,
          CONSTANTS.role,
          CONSTANTS.noResultsTitleText,
        );
        await pages.topPanel.goToCatalog();
        await pages.catalog.openFilterWithInput(CONSTANTS.ownerFilter);
        await pages.catalog.chooseOption(CONSTANTS.firstOwner);
        expect(await pages.catalog.isListItemVisible(CONSTANTS.bookETLDataEntity)).toBeTruthy();
      });
    });
    test('Check filter Tag', async ({ steps: { pages } }) => {
      await test.step('I click Tag filer', async () => {
        await pages.catalog.searchByText(CONSTANTS.bookETLDataEntity);
        await pages.catalog.clickOnListItem(CONSTANTS.bookETLDataEntity);
        await pages.dataEntity.createTag(CONSTANTS.tagFilterOption, CONSTANTS.noResultsTagText);
        await pages.topPanel.goToCatalog();
        await pages.catalog.openFilterWithInput(CONSTANTS.tagFilter);
        await pages.catalog.chooseOption(CONSTANTS.tagFilterOption);
        expect(await pages.catalog.isListItemVisible(CONSTANTS.bookETLDataEntity)).toBeTruthy();
      });
    });
    test('Check filter Type', async ({ steps: { pages } }) => {
      await test.step('I click Transformers tab', async () => {
        await pages.catalog.clickTab(CONSTANTS.transformersTag);
      });
      await test.step('I click Type filer', async () => {
        await pages.catalog.openFilterWithInput(CONSTANTS.typeFilter);
        await pages.catalog.searchByTextInFilter('Type', 'JOB');
        expect(await pages.catalog.isListItemVisible(CONSTANTS.bookETLDataEntity)).toBeTruthy();
      });
    });
    test('Check filter Group', async ({ steps: { pages } }) => {
      await test.step('I click filter Group', async () => {
        await pages.catalog.openFilterWithInput(CONSTANTS.groupsFilter);
        await pages.catalog.chooseOption(CONSTANTS.groupsOption);
        expect(
          await pages.catalog.isListItemVisible(CONSTANTS.postcardsAQADataEntity),
        ).toBeTruthy();
        expect(await pages.catalog.isListItemVisible(CONSTANTS.bookETLDataEntity)).toBeTruthy();
      });
    });
    test.describe('Apply multiply filter', () => {
      test.beforeEach(async ({ steps: { pages }, page }) => {
        await test.step(`I open catalog page`, async () => {
          await page.goto('');
          await pages.topPanel.goToCatalog();
        });
      });
      test('Different filter types', async ({ steps: { pages } }) => {
        await test.step('I click Tag filer', async () => {
          await pages.catalog.openFilterWithSelect(CONSTANTS.namespaceFilter);
          await pages.catalog.chooseOption(CONSTANTS.namespaceOption);
          expect(await pages.catalog.isListItemVisible(CONSTANTS.bookETLDataEntity)).toBeTruthy();
          expect(
            await pages.catalog.isListItemVisible(CONSTANTS.bookETLDataAQAEntity),
          ).toBeTruthy();
        });
        await test.step('I click Owner filter', async () => {
          await pages.catalog.openFilterWithInput(CONSTANTS.ownerFilter);
          await pages.catalog.chooseOption(CONSTANTS.firstOwner);
          expect(await pages.catalog.isListItemVisible(CONSTANTS.bookETLDataEntity)).toBeTruthy();
        });
      });
      test('Check all filters', async ({ steps: { pages } }) => {
        await test.step('I click Datasource filter', async () => {
          await pages.catalog.openFilterWithSelect(CONSTANTS.datasourceFilter);
          await pages.catalog.chooseOption(CONSTANTS.datasourceOptionBookETL);
        });
        await test.step('I click Tag filer', async () => {
          await pages.catalog.openFilterWithSelect(CONSTANTS.namespaceFilter);
          await pages.catalog.chooseOption(CONSTANTS.namespaceOption);
        });
        await test.step('I click Tag filer', async () => {
          await pages.catalog.openFilterWithInput(CONSTANTS.tagFilter);
          await pages.catalog.chooseOption(CONSTANTS.tagFilterOption);
        });
        await test.step('I click filter Group', async () => {
          await pages.catalog.openFilterWithInput(CONSTANTS.groupsFilter);
          await pages.catalog.chooseOption(CONSTANTS.groupsOption);
          expect(await pages.catalog.isListItemVisible(CONSTANTS.bookETLDataEntity)).toBeTruthy();
        });
      });
    });
  });
});
