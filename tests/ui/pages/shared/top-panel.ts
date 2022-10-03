import Dropdown from '../../elements/dropdown';
import BasePage from '../base-page';

type Tab = 'Catalog' | 'Management' | 'Dictionary' | 'Alerts' | 'Activity';

const SELECTORS = {
  sharedNavigation: (tab: string) => `span:has-text("${tab}")`,
};
export default class TopPanel extends BasePage {
  get userProfile() {
    return new Dropdown(
      this.page,
      'button[class*="eds__react-menu__menu-button"]',
      'ul[class*="rc-menu--open"]',
      'li[class*="rc-menu__item"]',
    );
  }

  /**
   *
   * @param tab
   */
  private async goTo(tab: Tab) {
    await this.page.click(SELECTORS.sharedNavigation(tab));
  }

  /**
   *
   */
  async goToCatalog() {
    await this.goTo('Catalog');
  }

  /**
   *
   */
  async goToManagement() {
    await this.goTo('Management');
  }

  /**
   *
   */
  async goToDictionary() {
    await this.goTo('Dictionary');
  }

  /**
   *
   */
  async goToAlerts() {
    await this.goTo('Alerts');
  }

  /**
   *
   */
  async goToActivity() {
    await this.goTo('Activity');
  }
}
