import type { DataModellingRoutes as dmRoutes } from 'routes/dataModellingRoutes';
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

interface AlertsRouteViewTypes {
  [AlertsRoutes.alertsViewType]:
    | typeof AlertsRoutes.all
    | typeof AlertsRoutes.my
    | typeof AlertsRoutes.dependents;
}

type AppAlertsRouteParams = AlertsRouteViewTypes;

interface ManagementRouteViewTypes {
  [ManagementRoutes.managementViewType]:
    | typeof ManagementRoutes.namespaces
    | typeof ManagementRoutes.datasources
    | typeof ManagementRoutes.collectors
    | typeof ManagementRoutes.owners
    | typeof ManagementRoutes.tags
    | typeof ManagementRoutes.associations
    | typeof ManagementRoutes.roles
    | typeof ManagementRoutes.policies
    | typeof ManagementRoutes.integrations;
  [ManagementRoutes.associationsViewType]:
    | typeof ManagementRoutes.associationsNew
    | typeof ManagementRoutes.associationsResolved;
  [ManagementRoutes.integrationViewType]:
    | typeof ManagementRoutes.overview
    | typeof ManagementRoutes.configure;
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

interface DataModellingRouteParams {
  [dmRoutes.QUERY_EXAMPLE_ID]: string;
}

interface AppDataModellingRouteParams {
  [dmRoutes.QUERY_EXAMPLE_ID]: number;
}

export type RouteParams = DataEntityRouteParams &
  TermRouteParams &
  SearchRouteParams &
  AlertsRouteViewTypes &
  ManagementRouteParams &
  DirectoryRouteParams &
  DataModellingRouteParams;

export type AppRouteParams = AppDataEntityRouteParams &
  AppSearchRouteParams &
  AppTermRouteParams &
  AppAlertsRouteParams &
  AppManagementRouteParams &
  AppDirectoryRouteParams &
  AppDataModellingRouteParams;
