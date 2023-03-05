export const EMBEDDED = 'embedded';

export enum AppRoutes {
  search = 'search',
  activity = 'activity',
  alerts = 'alerts',
  searchId = ':searchId',
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
