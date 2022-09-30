import { Page } from '@playwright/test';

import { Pages } from '../pages';

import GoToSteps from './go-to-steps';
// inject-import-step dont delete comment

/**
 * Entrypoint for any steps you can use in tests. Don't use it directly
 *
 */
export class Steps {
  // inject-step dont delete comment

  public goTo: GoToSteps;

  public pages: Pages;

  constructor(args: { page: Page }) {
    this.pages = new Pages(args.page);
    this.goTo = new GoToSteps({ ...args, steps: this });

    // inject-init-step dont delete comment
  }
}
