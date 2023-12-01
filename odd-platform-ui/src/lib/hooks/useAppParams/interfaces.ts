import type {
  DataEntityRoutes,
  SearchRoutes,
  TermsRoutes,
  DirectoryRoutes,
} from '../useAppPaths/shared';

interface DataEntityViewTypes {
  [DataEntityRoutes.dataEntityViewType]:
    | typeof DataEntityRoutes.overview
    | typeof DataEntityRoutes.lineage
    | typeof DataEntityRoutes.structure
    | typeof DataEntityRoutes.history
    | typeof DataEntityRoutes.alerts
    | typeof DataEntityRoutes.linkedEntities
    | typeof DataEntityRoutes.activity
    | typeof DataEntityRoutes.testReports
    | typeof DataEntityRoutes.discussions;
  [DataEntityRoutes.testReportViewType]:
    | typeof DataEntityRoutes.overview
    | typeof DataEntityRoutes.history;
  [DataEntityRoutes.structureViewType]:
    | typeof DataEntityRoutes.overview
    | typeof DataEntityRoutes.structureCompare;
}

interface DataEntityRouteParams extends DataEntityViewTypes {
  [DataEntityRoutes.dataEntityId]: string;
  [DataEntityRoutes.dataQATestId]: string;
  [DataEntityRoutes.versionId]: string;
  [DataEntityRoutes.messageId]: string;
}

interface AppDataEntityRouteParams extends DataEntityViewTypes {
  [DataEntityRoutes.dataEntityId]: number;
  [DataEntityRoutes.dataQATestId]: number;
  [DataEntityRoutes.versionId]: number;
  [DataEntityRoutes.messageId]: string;
}

interface TermRouteViewTypes {
  [TermsRoutes.termsViewType]:
    | typeof TermsRoutes.overview
    | typeof TermsRoutes.linkedEntities;
}

interface TermRouteParams extends TermRouteViewTypes {
  [TermsRoutes.termId]: string;
  [TermsRoutes.termSearchId]: string;
}

interface AppTermRouteParams extends TermRouteViewTypes {
  [TermsRoutes.termId]: number;
  [TermsRoutes.termSearchId]: string;
}

interface SearchRouteParams {
  [SearchRoutes.searchId]: string;
}

interface AppSearchRouteParams {
  [SearchRoutes.searchId]: string;
}

interface DirectoryRouteParams {
  [DirectoryRoutes.dataSourceTypePrefix]: string;
  [DirectoryRoutes.dataSourceId]: string;
  [DirectoryRoutes.typeId]: string;
}

interface AppDirectoryRouteParams {
  [DirectoryRoutes.dataSourceTypePrefix]: string;
  [DirectoryRoutes.dataSourceId]: number;
  [DirectoryRoutes.typeId]: undefined | number;
}

export type RouteParams = DataEntityRouteParams &
  TermRouteParams &
  SearchRouteParams &
  DirectoryRouteParams;

export type AppRouteParams = AppDataEntityRouteParams &
  AppSearchRouteParams &
  AppTermRouteParams &
  AppDirectoryRouteParams;
