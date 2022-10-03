import BaseStep from './base-step';

/**
 * class for entrypoints to site - urls you can visit directly/routes you take often
 */
export default class GoToSteps extends BaseStep {
  /**
   *
   */
  async catalog() {
    await this.pages.topPanel.goToCatalog();
  }

  /**
   *
   */
  async management() {
    await this.pages.topPanel.goToManagement();
  }
}
