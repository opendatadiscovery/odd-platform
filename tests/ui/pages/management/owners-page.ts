import Button from '../../elements/button';

import List from '../../elements/list';
import ManagementPage from './management-page';

const SELECTORS = {
  create_owner: `button:has-text("Create Owner")`,
  owner_line_root: 'div[class*="MuiGrid-root MuiGrid-container css-1d3bbye"]',
  owner_line_item: 'div[class*="MuiGrid-root MuiGrid-container sc-bWXABl lmxIQm css-1d3bbye"]',
  owner_description: (owner: string) => `div[class*="MuiGrid-container"]:has-text("${owner}")`,
};

export default class OwnersPage extends ManagementPage {
  get create_owner() {
    return new Button(this.page, SELECTORS.create_owner);
  }

  get owners_list() {
    return new List(this.page, SELECTORS.owner_line_root, SELECTORS.owner_line_item);
  }
}
