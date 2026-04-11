import { Page, test } from '@playwright/test';
import ErrorHandler from '../../common-utilities/error-handler';
import { configuration } from '../../config/configuration';
import * as environments from '../../config/environments.json';

export const goToPage = async (
  page: Page,
  url = environments.odd[configuration.environment] as string,
): Promise<void> => {
  await test.step(`Go to '${url}'`, async () => {
    try {
      await page.goto(url, { waitUntil: 'networkidle' });
    } catch (err) {
      new ErrorHandler(err).printError();
    }
  });
};
