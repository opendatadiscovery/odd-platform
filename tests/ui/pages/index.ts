import { Page } from '@playwright/test';

import LoginPage from './login-page';
import { Modals } from './modals';
import TopPanel from './shared/top-panel';
import ManagementPage from './management/management-page';
import OwnersPage from './management/owners-page';
// inject-import-page dont delete comment

export class Pages {
  readonly top_panel: TopPanel;

  readonly login: LoginPage;
  // inject-page dont delete comment

  readonly modals: Modals;
  readonly management: ManagementPage;
  readonly owners: OwnersPage;

  constructor(readonly page: Page) {
    this.top_panel = new TopPanel(this);
    this.login = new LoginPage(this);
    this.modals = new Modals(this);
    this.management = new ManagementPage(this);
    this.owners = new OwnersPage(this);
    // inject-init-page dont delete comment
  }
}
