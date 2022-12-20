import { Page } from '@playwright/test';

import ActivityPage from './activity/activity.page';
import CatalogPage from './catalog/catalog.page';
import DataEntityPage from './data_entity/data_entity.page';
import OverviewPage from './data_entity/overview.page';
import StructurePage from './data_entity/structure';
import LoginPage from './login-page';
import MainPage from './main/main-page';
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

  readonly main: MainPage;

  readonly catalog: CatalogPage;

  readonly activity: ActivityPage;

  readonly dataEntity: DataEntityPage;

  readonly overview: OverviewPage;

  readonly structure: StructurePage;

  readonly owners: OwnersPage;

  readonly tags: TagsPage;

  constructor(readonly page: Page) {
    this.topPanel = new TopPanel(this);
    this.login = new LoginPage(this);
    this.modals = new Modals(this);
    this.management = new ManagementPage(this);
    this.dataEntity = new DataEntityPage(this);
    this.overview = new OverviewPage(this);
    this.structure = new StructurePage(this);
    this.main = new MainPage(this);
    this.catalog = new CatalogPage(this);
    this.activity = new ActivityPage(this);
    this.owners = new OwnersPage(this);
    this.tags = new TagsPage(this);
  }
}
