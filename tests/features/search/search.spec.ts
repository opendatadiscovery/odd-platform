import { expect } from '@playwright/test';
import { test } from '../../config/test-base';

const entityNameWithAlphabeticChars = 'Book_ETL_aqa';
const entityNameWithSpecialChars = '_!AirFlights';
const numbersDataEntity = '737boeing';

test.describe('Search', () => {
  test.beforeEach(async ({ steps: { pages }, page }) => {
    await test.step(`I open Catalog page`, async () => {
      await page.goto('');
      await pages.topPanel.clickTab('Catalog');
    });
  });
  test.describe('When searching for a single keyword', () => {
    /**
     * /project/1/test-cases/17
     */
    test(`Should contain expected item with single word valid expression`, async ({
      steps: { pages },
    }) => {
      await test.step(`Fill valid expression in search input`, async () => {
        await pages.catalog.fillSearchBar(entityNameWithAlphabeticChars);
        await pages.catalog.confirmSearch();
        expect(await pages.catalog.isListItemVisible(entityNameWithAlphabeticChars)).toBeTruthy();
      });
    });
    /**
     * /project/1/test-cases/20
     */
    test(`Should display empty list with single word invalid expression`, async ({
      steps: { pages },
    }) => {
      await test.step(`Fill invalid expression in search input`, async () => {
        await pages.catalog.fillSearchBar('entityNameWithAlphabeticChars');
        await pages.catalog.confirmSearch();
        expect(await pages.catalog.isListEmpty()).toBeTruthy();
      });
    });
    /**
     * /project/1/test-cases/21
     */
    test(`Should contain expected item with single word expression which starts with special characters`, async ({
      steps: { pages },
    }) => {
      await test.step(`Fill single word expression which starts with special characters in the input`, async () => {
        await pages.catalog.fillSearchBar(entityNameWithSpecialChars);
        await pages.catalog.confirmSearch();
        expect(await pages.catalog.isListItemVisible(entityNameWithSpecialChars)).toBeTruthy();
      });
    });
    /**
     * /project/1/test-cases/35
     */
    test(`Should contain expected item with single word expression which starts with numbers`, async ({
      steps: { pages },
    }) => {
      await test.step(`Fill single word expression which starts with numbers in the input`, async () => {
        await pages.catalog.fillSearchBar(numbersDataEntity);
        await pages.catalog.confirmSearch();
        expect(await pages.catalog.isListItemVisible(numbersDataEntity)).toBeTruthy();
      });
    });
    /**
     * /project/1/test-cases/19
     */
    test(`Should display full list when searching by empty string`, async ({
      steps: { pages },
    }) => {
      await test.step(`Empty search string`, async () => {
        await pages.catalog.searchButton.click();
        expect(await pages.catalog.isListFull()).toBeTruthy();
      });
    });
  });
  test.describe('Search multiple words separated by spaces', () => {
    /**
     * /project/1/test-cases/18
     */
    test(`Should contain expected item when search expression is contained in one entity`, async ({
      steps: { pages },
    }) => {
      await test.step(`Fill expressions are contained in one entity`, async () => {
        await pages.catalog.fillSearchBar('books aqa');
        await pages.catalog.confirmSearch();
        expect(await pages.catalog.isListItemVisible('books_aqa')).toBeTruthy();
        expect(await pages.catalog.isListItemVisible(entityNameWithAlphabeticChars)).toBeTruthy();
      });
    });
    /**
     * /project/1/test-cases/104
     */
    test(`Should display empty list  when search expression is contained in different entities`, async ({
      steps: { pages },
    }) => {
      await test.step(`Fill expression are contained in different entities`, async () => {
        await pages.catalog.fillSearchBar('group aqa');
        await pages.catalog.confirmSearch();
        expect(await pages.catalog.isListEmpty()).toBeTruthy();
      });
    });
    /**
     * /project/1/test-cases/105
     */
    test(`Should contain expected list when search for entity by attribute which starts with number(s)`, async ({
      steps: { pages },
    }) => {
      await test.step(`Fill expressions are contained numbers and letters`, async () => {
        await pages.catalog.fillSearchBar('737boeing aqa');
        await pages.catalog.confirmSearch();
        expect(await pages.catalog.isListItemVisible(numbersDataEntity)).toBeTruthy();
      });
    });
    /**
     * /project/1/test-cases/106
     */
    test(`Should display empty list  when search for entity by multiple words: one expression is valid, another is invalid`, async ({
      steps: { pages },
    }) => {
      await test.step(`Fill valid expression and invalid expression`, async () => {
        await pages.catalog.fillSearchBar('book ticket');
        await pages.catalog.confirmSearch();
        expect(await pages.catalog.isListEmpty()).toBeTruthy();
      });
    });
    /**
     * /project/1/test-cases/107
     */
    test(`Should display empty list  when search for entity when both expressions are invalid`, async ({
      steps: { pages },
    }) => {
      await test.step(`Fill invalid expressions`, async () => {
        await pages.catalog.fillSearchBar('train ticket');
        await pages.catalog.confirmSearch();
        expect(await pages.catalog.isListEmpty()).toBeTruthy();
      });
    });
  });
});
