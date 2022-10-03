import Button from '../../elements/button';

import List from '../../elements/list';
import ManagementPage from './management-page';

const SELECTORS = {
  createOwner: `button:has-text("Create Owner")`,
  ownerLineRoot: 'div[class*="MuiGrid-root MuiGrid-container css-1d3bbye"]',
  ownerLineItem: 'div[class*="MuiGrid-root MuiGrid-container sc-bWXABl lmxIQm css-1d3bbye"]',
  ownerDescription: (owner: string) => `div[class*="MuiGrid-container"]:has-text("${owner}")`,
};

export default class OwnersPage extends ManagementPage {
  get createOwner() {
    return new Button(this.page, SELECTORS.createOwner);
  }

  get ownersList() {
    return new List(this.page, SELECTORS.ownerLineRoot, SELECTORS.ownerLineItem);
  }
}
