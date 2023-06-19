export const EMBEDDED = 'embedded';

export enum BaseRoutes {
  base = '/',
}

export enum ActivityRoutes {
  activity = 'activity',
}

export enum SearchRoutes {
  search = 'search',
  searchId = 'searchId',
  searchIdParam = ':searchId',
}

export enum DataEntityRoutes {
  dataentities = 'dataentities',
  dataEntityId = 'dataEntityId',
  dataEntityIdParam = ':dataEntityId',
  dataQATestId = 'dataQATestId',
  dataQATestIdParam = ':dataQATestId',
  messageId = 'messageId',
  messageIdParam = ':messageId',
  dataEntityViewType = 'dataEntityViewType',
  dataEntityViewTypeParam = ':dataEntityViewType',
  testReportViewType = 'testReportViewType',
  testReportViewTypeParam = ':testReportViewType',
  versionId = 'versionId',
  versionIdParam = ':versionId',
  overview = 'overview',
  lineage = 'lineage',
  structure = 'structure',
  structureViewType = 'structureViewType',
  structureViewTypeParam = ':structureViewType',
  structureCompare = 'compare',
  testReports = 'test-reports',
  history = 'history',
  alerts = 'alerts',
  linkedItems = 'linked-items',
  activity = 'activity',
  discussions = 'discussions',
  createMessage = 'createMessage',
  retries = 'retries',
}

export enum AlertsRoutes {
  alerts = 'alerts',
  all = 'all',
  my = 'my',
  dependents = 'dependents',
  alertsViewType = 'alertsViewType',
  alertsViewTypeParam = ':alertsViewType',
}

export enum ManagementRoutes {
  managementViewType = 'managementViewType',
  managementViewTypeParam = ':managementViewType',
  management = 'management',
  namespaces = 'namespaces',
  datasources = 'datasources',
  collectors = 'collectors',
  owners = 'owners',
  tags = 'tags',
  labels = 'labels',
  associations = 'associations',
  associationsViewType = 'associationsViewType',
  associationsViewTypeParam = ':associationsViewType',
  associationsNew = 'new',
  associationsResolved = 'resolved',
  roles = 'roles',
  policies = 'policies',
  createPolicy = 'createPolicy',
  policyId = 'policyId',
  policyIdParam = ':policyId',
  integrations = 'integrations',
  integrationId = 'integrationId',
  integrationIdParam = ':integrationId',
  integrationViewType = 'integrationViewType',
  integrationViewTypeParam = ':integrationViewType',
  overview = 'overview',
  configure = 'configure',
}

export enum TermsRoutes {
  termSearch = 'termsearch',
  terms = 'terms',
  termSearchId = 'termSearchId',
  termSearchIdParam = ':termSearchId',
  termId = 'termId',
  termIdParam = ':termId',
  termsViewType = 'termsViewType',
  termsViewTypeParam = ':termsViewType',
  overview = 'overview',
  linkedItems = 'linked-items',
}

export enum DirectoryRoutes {
  directory = 'directory',
  dataSourceTypePrefix = 'dataSourceTypePrefix',
  dataSourceTypePrefixParam = ':dataSourceTypePrefix',
  dataSourceId = 'dataSourceId',
  dataSourceIdParam = ':dataSourceId',
  typeId = 'typeId',
  typeIdParam = ':typeId',
}
