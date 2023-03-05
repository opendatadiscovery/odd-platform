export const EMBEDDED = 'embedded';

export enum AppRoutes {
  search = 'search',
  activity = 'activity',
  alerts = 'alerts',
  searchId = ':searchId',
}

export enum DataEntityRoutes {
  dataentities = 'dataentities',
  dataEntityId = ':dataEntityId',
  dataQATestId = ':dataQATestId?',
  messageId = ':messageId',
  viewType = ':viewType?',
  overview = 'overview',
  lineage = 'lineage',
  structure = 'structure',
  testReports = 'test-reports',
  history = 'history',
  alerts = 'alerts',
  linkedItems = 'linked-items',
  activity = 'activity',
  collaboration = 'collaboration',
  createMessage = 'createMessage',
  retries = 'retries',
}

export enum AlertsRoutes {
  alerts = 'alerts',
  all = 'all',
  my = 'my',
  dependents = 'dependents',
  viewType = ':viewType',
}

export enum ManagementRoutes {
  viewType = ':viewType',
  management = 'management',
  namespaces = 'namespaces',
  datasources = 'datasources',
  collectors = 'collectors',
  owners = 'owners',
  tags = 'tags',
  labels = 'labels',
  associations = 'associations',
  associationsNew = 'New',
  associationsResolved = 'Resolved',
  roles = 'roles',
  policies = 'policies',
  createPolicy = 'createPolicy',
  policyId = ':policyId',
}

export enum TermsRoutes {
  termSearch = 'termsearch',
  terms = 'terms',
  termSearchId = ':termSearchId',
  termId = ':termId',
  viewType = ':viewType',
  overview = 'overview',
  linkedItems = 'linked-items',
}
