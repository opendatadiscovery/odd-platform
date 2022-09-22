import test, { Page } from '@playwright/test';

import * as environments from '../../config/environments.json';
import ErrorHandler from '../../common-utilities/error-handler';
import { configuration } from '../../config/configuration';

export const go_to_page = async (
  page: Page,
  // @ts-ignore
  url = environments.odd[configuration.environment] as string,
): Promise<void> => {
  await test.step(`Go to '${url}'`, async () => {
    try {
      await page.goto(url, { waitUntil: 'networkidle' });
    } catch (err) {
      new ErrorHandler(err).print_error();
    }
  });
};
