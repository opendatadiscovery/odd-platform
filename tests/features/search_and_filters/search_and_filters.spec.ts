import { expect } from '@playwright/test';
import { test } from '../../config/test-base';

test.describe('Check filters and search', function () {
    test.describe('Check filters', function () {
        test.beforeEach(async ({ steps: { pages }, page}) => {
            await test.step(`I open catalog page`, async () => {
                await page.goto('');
                await pages.top_panel.go_to_catalog();
            })
        });
        test.only('Check filter Datasource', async ({ steps: { pages }, page }) => {
            await test.step('I click Datasource filter', async () => {
                await pages.catalog.openFilterWithSelect(`Datasource`);
                await pages.catalog.chooseOption('Kinesis Data Stream consumer')
            });
        });
    });
});
