import { Page } from '@playwright/test';

import { Steps } from './index';

export type StepArgs = {
  page: Page;
  steps: Steps;
};

export default abstract class BaseStep {
  constructor(
    args: StepArgs,
    protected readonly page = args.page,
    protected readonly pages = args.steps.pages,
    protected readonly steps = args.steps,
  ) {}
}
