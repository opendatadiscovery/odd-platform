import type {
  AlertsRoutes,
  DataEntityRoutes,
  ManagementRoutes,
  SearchRoutes,
  TermsRoutes,
  DirectoryRoutes,
} from '../useAppPaths/shared';

interface DataEntityViewTypes {
  [DataEntityRoutes.dataEntityViewType]:
    | DataEntityRoutes.overview
    | DataEntityRoutes.lineage
    | DataEntityRoutes.structure
    | DataEntityRoutes.history
    | DataEntityRoutes.alerts
    | DataEntityRoutes.linkedItems
    | DataEntityRoutes.activity
    | DataEntityRoutes.testReports
    | DataEntityRoutes.discussions;
  [DataEntityRoutes.testReportViewType]:
    | DataEntityRoutes.overview
    | DataEntityRoutes.history;
  [DataEntityRoutes.structureViewType]:
    | DataEntityRoutes.overview
    | DataEntityRoutes.structureCompare;
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
  [TermsRoutes.termsViewType]: TermsRoutes.overview | TermsRoutes.linkedItems;
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

interface AlertsRouteViewTypes {
  [AlertsRoutes.alertsViewType]:
    | AlertsRoutes.all
    | AlertsRoutes.my
    | AlertsRoutes.dependents;
}

type AppAlertsRouteParams = AlertsRouteViewTypes;

interface ManagementRouteViewTypes {
  [ManagementRoutes.managementViewType]:
    | ManagementRoutes.namespaces
    | ManagementRoutes.datasources
    | ManagementRoutes.collectors
    | ManagementRoutes.owners
    | ManagementRoutes.tags
    | ManagementRoutes.labels
    | ManagementRoutes.associations
    | ManagementRoutes.roles
    | ManagementRoutes.policies
    | ManagementRoutes.integrations;
  [ManagementRoutes.associationsViewType]:
    | ManagementRoutes.associationsNew
    | ManagementRoutes.associationsResolved;
  [ManagementRoutes.integrationViewType]:
    | ManagementRoutes.overview
    | ManagementRoutes.configure;
}

interface ManagementRouteParams extends ManagementRouteViewTypes {
  [ManagementRoutes.policyId]: string;
  [ManagementRoutes.integrationId]: string;
}

interface AppManagementRouteParams extends ManagementRouteViewTypes {
  [ManagementRoutes.policyId]: number;
  [ManagementRoutes.integrationId]: string;
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
  AlertsRouteViewTypes &
  ManagementRouteParams &
  DirectoryRouteParams;

export type AppRouteParams = AppDataEntityRouteParams &
  AppSearchRouteParams &
  AppTermRouteParams &
  AppAlertsRouteParams &
  AppManagementRouteParams &
  AppDirectoryRouteParams;
