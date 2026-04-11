import Button from '../../elements/button';

import List from '../../elements/list';
import ManagementPage from './management-page';

const SELECTORS = {
  createOwner: `button:has-text("Create Owner")`,
  ownerLineRoot: 'div#owners-list',
  ownerLineItem: 'p.css-1cbt2p6',
};

export default class OwnersPage extends ManagementPage {
  get createOwner() {
    return new Button(this.page, SELECTORS.createOwner);
  }

  get ownersList() {
    return new List(this.page, SELECTORS.ownerLineRoot, SELECTORS.ownerLineItem);
  }
}
