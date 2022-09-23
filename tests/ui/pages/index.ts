import { Page } from '@playwright/test';

import LoginPage from './login-page';
import { Modals } from './modals';
import TopPanel from './shared/top-panel';
import ManagementPage from './management/management-page';
import OwnersPage from './management/owners-page';
import TagsPage from "./management/tags-page";
// inject-import-page dont delete comment

export class Pages {
  readonly top_panel: TopPanel;

  readonly login: LoginPage;
  // inject-page dont delete comment

  readonly modals: Modals;
  readonly management: ManagementPage;
  readonly owners: OwnersPage;
  readonly tags: TagsPage;

  constructor(readonly page: Page) {
    this.top_panel = new TopPanel(this);
    this.login = new LoginPage(this);
    this.modals = new Modals(this);
    this.management = new ManagementPage(this);
    this.owners = new OwnersPage(this);
    this.tags = new TagsPage(this);
    // inject-init-page dont delete comment
  }
}
