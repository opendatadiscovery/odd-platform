import BasePage from '../base-page';

type Tab = 'Overview' | 'History' | 'Alerts' | 'Activity';

const SELECTORS = {
  sharedNavigation: (tab: string) => `span:has-text("${tab}")`,
};

export default class DataEntityPage extends BasePage {
  async clickTab(tabName: Tab) {
    await this.page.click(SELECTORS.sharedNavigation(tabName));
  }
}
