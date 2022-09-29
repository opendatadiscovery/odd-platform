import Dropdown from '../../elements/dropdown';
import BasePage from '../base-page';

type Tab = 'Catalog' | 'Management' | 'Dictionary' | 'Alerts' | 'Activity';

const SELECTORS = {
  shared_navigation: (tab: string) => `span:has-text("${tab}")`,
};
export default class TopPanel extends BasePage {
  get user_profile() {
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
  private async go_to(tab: Tab) {
    await this.page.click(SELECTORS.shared_navigation(tab));
  }

  /**
   *
   */
  async go_to_catalog() {
    await this.go_to('Catalog');
  }

  /**
   *
   */
  async go_to_management() {
    await this.go_to('Management');
  }

  /**
   *
   */
  async go_to_dictionary() {
    await this.go_to('Dictionary');
  }

  /**
   *
   */
  async go_to_alerts() {
    await this.go_to('Alerts');
  }

  /**
   *
   */
  async go_to_activity() {
    await this.go_to('Activity');
  }
}
