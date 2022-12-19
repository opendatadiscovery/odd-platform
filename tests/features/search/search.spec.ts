import { expect } from '@playwright/test';
import { test } from '../../config/test-base';

const entityNameWithAlphabeticChars = 'Book_ETL_aqa';
const entityNameWithSpecialChars = '_!AirFlights';
const entityNameWithNumbers = '737boeing';

test.describe('Search by name of data-entity', () => {
  test.beforeEach(async ({ steps: { pages }, page }) => {
    await test.step(`I open Catalog page`, async () => {
      await page.goto('');
      await pages.topPanel.clickTab('Catalog');
    });
  });
  test.describe('Search for a single keyword', () => {
    /**
     * /project/1/test-cases/17
     */
    test(`Display an expected item with valid expression`, async ({ steps: { pages } }) => {
      await test.step(`When fill a valid expression in the search input`, async () => {
        await pages.catalog.searchBy(entityNameWithAlphabeticChars);
        expect(await pages.catalog.isListItemVisible(entityNameWithAlphabeticChars)).toBeTruthy();
      });
    });
    /**
     * /project/1/test-cases/20
     */
    test(`Display an empty list with invalid expression`, async ({ steps: { pages } }) => {
      await test.step(`When fill an invalid expression in search input`, async () => {
        await pages.catalog.searchBy('my_invalid_expression');
        expect(await pages.catalog.resultsList.isListEmpty()).toBeTruthy();

        expect(await pages.catalog.isAlertVisible()).toBeTruthy();
      });
    });
    /**
     * /project/1/test-cases/21
     */
    test(`Display expected item with an expression which starts with special characters`, async ({
      steps: { pages },
    }) => {
      await test.step(`When fill an expression which starts with special characters in the input`, async () => {
        await pages.catalog.searchBy(entityNameWithSpecialChars);
        expect(await pages.catalog.isListItemVisible(entityNameWithSpecialChars)).toBeTruthy();
      });
    });
    /**
     * /project/1/test-cases/35
     */
    test(`Display an expected item with expression which starts with numbers`, async ({
      steps: { pages },
    }) => {
      await test.step(`When fill an expression which starts with numbers in the input`, async () => {
        await pages.catalog.searchBy(entityNameWithNumbers);
        expect(await pages.catalog.isListItemVisible(entityNameWithNumbers)).toBeTruthy();
      });
    });
    test.describe('"No matches found" alert message', () => {
      /**
       * /project/1/test-cases/19
       */
      test(`Not displayed alert message when list is not empty`, async ({ steps: { pages } }) => {
        await test.step(`When fill an empty expression`, async () => {
          await pages.catalog.searchBy('');
          expect(await pages.catalog.countListItems()).toBeGreaterThanOrEqual(6);
          expect(await pages.catalog.isAlertHidden()).toBeTruthy();
        });
      });
    });
  });
  test.describe('Search multiple words separated by spaces', () => {
    /**
     * /project/1/test-cases/18
     */
    test(`Display an expected item when search expression is contained in one entity`, async ({
      steps: { pages },
    }) => {
      await test.step(`When fill an expressions are contained in one entity`, async () => {
        await pages.catalog.searchBy('books aqa');
        expect(await pages.catalog.isListItemVisible('books_aqa')).toBeTruthy();
        expect(await pages.catalog.isListItemVisible(entityNameWithAlphabeticChars)).toBeTruthy();
      });
    });
    /**
     * /project/1/test-cases/104
     */
    test(`Display an empty list when search expression is contained in different entities`, async ({
      steps: { pages },
    }) => {
      await test.step(`When fill expression are contained in different entities`, async () => {
        await pages.catalog.searchBy('group aqa');
        expect(await pages.catalog.isAlertVisible()).toBeTruthy();
      });
    });
    /**
     * /project/1/test-cases/105
     */
    test(`Display an expected list when search for entity by attribute which starts with number`, async ({
      steps: { pages },
    }) => {
      await test.step(`When fill an expressions are contained numbers and letters`, async () => {
        await pages.catalog.searchBy('737boeing aqa');
        expect(await pages.catalog.isListItemVisible(entityNameWithNumbers)).toBeTruthy();
      });
    });
    /**
     * /project/1/test-cases/106
     */
    test(`Display an empty list when entering 1 valid and 1 invalid expression`, async ({
      steps: { pages },
    }) => {
      await test.step(`When fill a valid expression and invalid expression`, async () => {
        await pages.catalog.searchBy('book ticket');
        expect(await pages.catalog.isAlertVisible()).toBeTruthy();
      });
    });
    /**
     * /project/1/test-cases/107
     */
    test(`Display an empty list when search for entity when both expressions are invalid`, async ({
      steps: { pages },
    }) => {
      await test.step(`When fill an invalid expressions`, async () => {
        await pages.catalog.searchBy('train ticket');
        expect(await pages.catalog.isAlertVisible()).toBeTruthy();
      });
    });
    /**
     * /project/1/test-cases/22
     */
    test(`Cleanup the search bar`, async ({ steps: { pages } }) => {
      await test.step(`When fill an expression`, async () => {
        await pages.catalog.searchBy('ticket');
      });
      await test.step(`When clean the input`, async () => {
        await pages.catalog.cleanSearchBar.click();
        expect(await pages.catalog.searchBar.innerText()).toEqual('');
      });
    });
  });
});
