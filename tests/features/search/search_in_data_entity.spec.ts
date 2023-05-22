import { expect } from '@playwright/test';
import { test } from '../../config/test-base';

const entityNameWithAlphabeticChars = 'Book_ETL_aqa';
const entityWithStructure = 'books_aqa';
const entityNameWithNumbers = '737boeing';
const entityNameBeforeRename = 'postcards_aqa';
const entityNameAfterRename = 'renamed_data_entity';
const entityNameBeforeRename2 = 'magazines_aqa';
const entityNameAfterRename2 = 'renamed_data_entity2';
const externalDescription = 'the newest books in the city';

test.describe('Search by data in data-entity in the Catalog', () => {
  test.beforeEach(async ({ steps: { pages }, page }) => {
    await test.step(`I open Catalog page`, async () => {
      await page.goto('');
      await pages.topPanel.clickTab('Catalog');
    });
  });
  /**
   * /project/1/test-cases/112
   * /project/1/test-cases/115
   * /project/1/test-cases/123
   * /project/1/test-cases/124
   */
  const parameters = [
    { testName: 'tag', inputValue: 'tagForSearching' },
    { testName: 'namespace', inputValue: 'ETL' },
    { testName: 'pre-defined metadata', inputValue: 'Base_of_books' },
    { testName: 'external description', inputValue: externalDescription },
  ];
  for (const parameter of parameters) {
    test(`Display an expected item with expression in ${parameter.testName}`, async ({
      steps: { pages },
    }) => {
      await test.step(`When filling a valid expression in the search input`, async () => {
        await pages.catalog.searchBy(`${parameter.inputValue}`);
        expect(await pages.catalog.isListItemVisible(entityNameWithAlphabeticChars)).toBeTruthy();
      });
    });
  }
  /**
   * /project/1/test-cases/111
   */
  test(`Display an expected item with expression in internal description`, async ({
    workerId,
    steps: { pages },
  }) => {
    const customDescription = `This data-entity shows and describe new books in the First avenue + ${workerId}`;
    await test.step(`When filling a valid expression in the search input`, async () => {
      await pages.catalog.searchBy(entityNameWithAlphabeticChars);
      await pages.catalog.clickOnListItem(entityNameWithAlphabeticChars);
      await pages.overview.fillCustomDescriptionInput(customDescription);
      await pages.topPanel.clickTab('Catalog');
      await pages.catalog.searchBy('first');
      expect(await pages.catalog.isListItemVisible(entityNameWithAlphabeticChars)).toBeTruthy();
    });
  });
  /**
   * /project/1/test-cases/113
   */
  test(`Display an expected item with expression in custom metadata`, async ({
    workerId,
    steps: { pages },
  }) => {
    const matadataName = `isOnSale + ${workerId}`;
    await test.step(`When filling a valid expression in the search input`, async () => {
      await pages.catalog.searchBy(entityNameWithAlphabeticChars);
      await pages.catalog.clickOnListItem(entityNameWithAlphabeticChars);
      await pages.overview.createCustomMetadata(matadataName);
      await pages.topPanel.clickTab('Catalog');
      await pages.catalog.searchBy(matadataName);
      expect(await pages.catalog.isListItemVisible(entityNameWithAlphabeticChars)).toBeTruthy();
    });
  });
  /**
   * /project/1/test-cases/114
   */
  test(`Display an expected item with expression in dataset field name`, async ({
    steps: { pages },
  }) => {
    await test.step(`When filling a valid expression in the search input`, async () => {
      await pages.catalog.searchBy('genre_id');
      expect(await pages.catalog.isListItemVisible(entityWithStructure)).toBeTruthy();
    });
  });
  /**
   * /project/1/test-cases/116
   */
  test(`Display an expected item with expression in datasource name`, async ({
    steps: { pages },
  }) => {
    await test.step(`When filling a valid expression in the search input`, async () => {
      await pages.catalog.searchBy('oracle_airplanes');
      expect(await pages.catalog.isListItemVisible(entityNameWithNumbers)).toBeTruthy();
    });
  });
  /**
   * /project/1/test-cases/118
   * #concurrentModificationIssue
   */
  test(`Display an expected item with expression in owner's name`, async ({
    workerId,
    steps: { pages },
  }) => {
    const ownerName4 = `ownerName4${workerId}`;
    const ownerTitle4 = `ownerTitle4${workerId}`;
    await test.step(`When filling a valid expression in the search input`, async () => {
      await pages.catalog.searchBy(entityWithStructure);
      await pages.catalog.clickOnListItem(entityWithStructure);
      await pages.overview.createOwner(ownerName4, ownerTitle4);
      await pages.topPanel.clickTab('Catalog');
      await pages.catalog.searchBy(ownerName4);
      expect(await pages.catalog.isListItemVisible(entityWithStructure)).toBeTruthy();
    });
  });
  /**
   * /project/1/test-cases/119
   * #concurrentModificationIssue
   */
  test(`Display an expected item with expression in name and owner`, async ({
    workerId,
    steps: { pages },
  }) => {
    const ownerName6 = `ownerName6${workerId}`;
    const ownerTitle6 = `ownerTitle6${workerId}`;
    await test.step(`When filling a valid expression in the search input`, async () => {
      await pages.catalog.searchBy(entityNameWithAlphabeticChars);
      await pages.catalog.clickOnListItem(entityNameWithAlphabeticChars);
      await pages.overview.createOwner(ownerName6, ownerTitle6);
      await pages.topPanel.clickTab('Catalog');
      await pages.catalog.searchBy(`${ownerName6} ${entityNameWithAlphabeticChars}`);
      expect(await pages.catalog.isListItemVisible(entityNameWithAlphabeticChars)).toBeTruthy();
    });
  });
  /**
   * /project/1/test-cases/120
   * #concurrentModificationIssue
   */
  test(`Display an expected item with expression in "about" field and owner`, async ({
    workerId,
    steps: { pages },
  }) => {
    const ownerName777 = `ownerName777${workerId}`;
    const ownerTitle777 = `ownerTitle777${workerId}`;
    await test.step(`When filling a valid expression in the search input`, async () => {
      await pages.catalog.searchBy(entityNameWithAlphabeticChars);
      await pages.catalog.clickOnListItem(entityNameWithAlphabeticChars);
      await pages.overview.createOwner(ownerName777, ownerTitle777);
      await pages.topPanel.clickTab('Catalog');
      await pages.catalog.searchBy(`${externalDescription} ${ownerName777}`);
      expect(await pages.catalog.isListItemVisible(entityNameWithAlphabeticChars)).toBeTruthy();
    });
  });
  /**
   * /project/1/test-cases/121
   */
  test(`Display an expected item with expression in metadata and dataset field name`, async ({
    steps: { pages },
  }) => {
    await test.step(`When filling a valid expression in the search input`, async () => {
      await pages.catalog.searchBy('gifts edible');
      expect(await pages.catalog.isListItemVisible('souvenirs_aqa')).toBeTruthy();
    });
  });
  /**
   * /project/1/test-cases/122
   */
  test(`Display an expected item with expression in custom name`, async ({ steps: { pages } }) => {
    await test.step(`When filling a valid expression in the search input`, async () => {
      await pages.catalog.searchBy(entityNameBeforeRename);
      await pages.catalog.clickOnListItem(entityNameBeforeRename);
      await pages.overview.addCustomName(entityNameAfterRename);
      await pages.topPanel.clickTab('Catalog');
      await pages.catalog.searchBy(entityNameAfterRename);
      expect(await pages.catalog.isListItemVisible(entityNameAfterRename)).toBeTruthy();
    });
  });
  /**
   * /project/1/test-cases/125
   * #concurrentModificationIssue
   */
  test(`Display an expected item with expression in owner's title`, async ({
    workerId,
    steps: { pages },
  }) => {
    const ownerName5 = `ownerName5${workerId}`;
    const ownerTitle5 = `ownerTitle5${workerId}`;
    await test.step(`When filling a valid expression in the search input`, async () => {
      await pages.catalog.searchBy(entityNameWithAlphabeticChars);
      await pages.catalog.clickOnListItem(entityNameWithAlphabeticChars);
      await pages.overview.createOwner(ownerName5, ownerTitle5);
      await pages.topPanel.clickTab('Catalog');
      await pages.catalog.searchBy(ownerTitle5);
      expect(await pages.catalog.isListItemVisible(entityNameWithAlphabeticChars)).toBeTruthy();
    });
  });
  /**
   * /project/1/test-cases/128
   */
  test(` Display an expected item with expression in label names`, async ({
    workerId,
    steps: { pages },
  }) => {
    const label = `famous + ${workerId}`;
    await test.step(`When filling a valid expression in the search input`, async () => {
      await pages.catalog.searchBy('art_aqa');
      await pages.catalog.clickOnListItem('art_aqa');
      await pages.structure.goToStructureTab.click();
      await pages.structure.addLabel(`isLocal`, label);
      await pages.topPanel.clickTab('Catalog');
      await pages.catalog.searchBy(label);
      expect(await pages.catalog.isListItemVisible('art_aqa')).toBeTruthy();
    });
  });
  /**
   * /project/1/test-cases/136
   */
  test(` Display an expected item with expression in custom name by external name`, async ({
    steps: { pages },
  }) => {
    await test.step(`When filling a valid expression in the search input`, async () => {
      await pages.catalog.searchBy(entityNameBeforeRename2);
      await pages.catalog.clickOnListItem(entityNameBeforeRename2);
      await pages.overview.addCustomName(entityNameAfterRename2);
      await pages.topPanel.clickTab('Catalog');
      await pages.catalog.searchBy(entityNameBeforeRename2);
      expect(await pages.catalog.isListItemVisible(entityNameAfterRename2)).toBeTruthy();
    });
  });
});
test.describe('Search by data in data-entity in the main page', () => {
  test.beforeEach(async ({ steps: { pages }, page }) => {
    await test.step(`I open main page`, async () => {
      await page.goto('');
    });
  });
  /**
   * /project/1/test-cases/137
   */
  test(`Display an expected item with expression in dropdown in the main page`, async ({
    steps: { pages },
  }) => {
    await test.step(`When filling a valid expression in the search input`, async () => {
      await pages.main.search('pilots');
      expect(await pages.main.isListItemVisible(entityNameWithNumbers)).toBeTruthy();
      expect(await pages.main.resultList.count()).toBeGreaterThanOrEqual(3);
    });
  });
});
