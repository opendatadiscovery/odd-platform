import { expect } from '@playwright/test';
import { test } from '../../config/test-base';

test.describe('Check filters and search', () => {
  test.describe('Check filters', () => {
      test.beforeEach(async ({steps: {pages}, page}) => {
          await test.step(`I open catalog page`, async () => {
              await page.goto('');
              await pages.topPanel.goToCatalog();
          });
      });
      test('Check filter Datasource', async ({steps: {pages}}) => {
          await test.step('I click Datasource filter', async () => {
              await pages.catalog.openFilterWithSelect(`Datasource`);
              await pages.catalog.chooseOption('Air_flights');
              expect(await pages.catalog.isVisible('_!+AirFlights')).toBeTruthy();
          });
      });
      test('Check filter Namespace', async ({steps: {pages}}) => {
          await test.step('I click Namespace filter', async () => {
              await pages.catalog.openFilterWithSelect(`Namespace`);
              await pages.catalog.chooseOption('ETL');
              expect(await pages.catalog.isVisible('_!+AirFlights')).toBeTruthy();
              expect(await pages.catalog.isVisible('BookETL')).toBeTruthy();
              expect(await pages.catalog.isVisible('Book_ETL_aqa')).toBeTruthy();
              expect(await pages.catalog.isVisible('kds_clickstream_consumer')).toBeTruthy();
          });
      });
      test('Check filter Owner', async ({steps: {pages}}) => {
          await test.step('I click owner filter', async () => {
              await pages.catalog.fillSearchString('BookETL');
              await pages.catalog.openDataEntity('BookETL');
              await pages.dataEntity.createOwner(
                  'firstOwner',
                  `No result. Create new owner "firstOwner"`,
                  'admin',
                  `No result. Create new title "admin"`,
              );
              await pages.topPanel.goToCatalog();
              await pages.catalog.openFilterWithInput(`Owner`);
              await pages.catalog.chooseOption('firstOwner');
              expect(await pages.catalog.isVisible('BookETL')).toBeTruthy();
          });
      });
      test('Check filter Tag', async ({steps: {pages}}) => {
          await test.step('I click Tag filer', async () => {
              await pages.catalog.fillSearchString('BookETL');
              await pages.catalog.openDataEntity('BookETL');
              await pages.dataEntity.createTag('aqa_tag', `No result. Create new tag "aqa_tag"`);
              await pages.topPanel.goToCatalog();
              await pages.catalog.openFilterWithInput(`Tag`);
              await pages.catalog.chooseOption('aqa_tag');
              expect(await pages.catalog.isVisible('BookETL')).toBeTruthy();
          });
      });
      test('Check filter Type', async ({steps: {pages}}) => {
          await test.step('I click Transformers tab', async () => {
              await pages.catalog.clickTab('Transformers');
          })
          await test.step('I click Type filer', async () => {
              await pages.catalog.openFilterWithInput(`Type`);
              await pages.catalog.chooseOptionJobInTypeFilter;
              expect(await pages.catalog.isVisible('Book_ETL')).toBeTruthy();
          });
      });
      test('Different filter types', async ({steps: {pages}}) => {
          await test.step('I click Tag filer', async () => {
              await pages.catalog.openFilterWithSelect(`Namespace`);
              await pages.catalog.chooseOption('ETL');
              expect(await pages.catalog.isVisible('_!+AirFlights')).toBeTruthy();
              expect(await pages.catalog.isVisible('BookETL')).toBeTruthy();
              expect(await pages.catalog.isVisible('Book_ETL_aqa')).toBeTruthy();
          });
          await test.step('I click Owner filter', async () => {
              await pages.catalog.openFilterWithInput(`Owner`);
              await pages.catalog.chooseOption('firstOwner');
              expect(await pages.catalog.isVisible('BookETL')).toBeTruthy();
          });
      });
      test('Check filter Group', async ({steps: {pages}}) => {
          await test.step('I click filter Group', async () => {
              await pages.catalog.openFilterWithInput(`Groups`);
              await pages.catalog.chooseOption('group_bookshop');
              expect(await pages.catalog.isVisible('postcards_aqa')).toBeTruthy();
              expect(await pages.catalog.isVisible('BookETL')).toBeTruthy();
          });
      });
      test('Check all filters', async ({steps: {pages}}) => {
          await test.step('I click Datasource filter', async () => {
              await pages.catalog.openFilterWithSelect(`Datasource`);
              await pages.catalog.chooseOption('Bookshop ETL');
          });
              await test.step('I click Tag filer', async () => {
                  await pages.catalog.openFilterWithSelect(`Namespace`);
                  await pages.catalog.chooseOption('ETL');
              });
              await test.step('I click Tag filer', async () => {
                  await pages.catalog.openFilterWithInput(`Tag`);
                  await pages.catalog.chooseOption('aqa_tag');
              });
          await test.step('I click filter Group', async () => {
              await pages.catalog.openFilterWithInput(`Groups`);
              await pages.catalog.chooseOption('group_bookshop');
              expect(await pages.catalog.isVisible('BookETL')).toBeTruthy();
          });
      });
  });
});
