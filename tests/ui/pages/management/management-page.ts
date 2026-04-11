import Button from '../../elements/button';
import BasePage from '../base-page';

const SELECTORS = {
  owners: 'a:has-text("Owners")',
  tags: 'a:has-text("Tags")',
};

export default class ManagementPage extends BasePage {
  get owners() {
    return new Button(this.page, SELECTORS.owners);
  }

  get tags() {
    return new Button(this.page, SELECTORS.tags);
  }
}
