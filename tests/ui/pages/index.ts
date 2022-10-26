import { Page } from '@playwright/test';

import CatalogPage from './catalog/catalog_page';
import DataEntityPage from './data_entity/data_entity.page';
import OverviewPage from './data_entity/overview.page';
import LoginPage from './login-page';
import ManagementPage from './management/management-page';
import OwnersPage from './management/owners-page';
import TagsPage from './management/tags-page';
import { Modals } from './modals';
import TopPanel from './shared/top-panel';

export class Pages {
  readonly topPanel: TopPanel;

  readonly login: LoginPage;

  readonly modals: Modals;

  readonly management: ManagementPage;

  readonly catalog: CatalogPage;

  readonly dataEntity: DataEntityPage;

  readonly overview: OverviewPage;

  readonly owners: OwnersPage;

  readonly tags: TagsPage;

  constructor(readonly page: Page) {
    this.topPanel = new TopPanel(this);
    this.login = new LoginPage(this);
    this.modals = new Modals(this);
    this.management = new ManagementPage(this);
    this.dataEntity = new DataEntityPage(this);
    this.overview = new OverviewPage(this);
    this.catalog = new CatalogPage(this);
    this.owners = new OwnersPage(this);
    this.tags = new TagsPage(this);
  }
}
