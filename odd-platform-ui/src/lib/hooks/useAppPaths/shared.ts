export const EMBEDDED = 'embedded';

export const ActivityRoutes = {
  activity: 'activity',
} as const;

export const SearchRoutes = {
  search: 'search',
  searchId: 'searchId',
  searchIdParam: ':searchId',
} as const;

export const DataEntityRoutes = {
  dataentities: 'dataentities',
  dataEntityId: 'dataEntityId',
  dataEntityIdParam: ':dataEntityId',
  dataQATestId: 'dataQATestId',
  dataQATestIdParam: ':dataQATestId',
  messageId: 'messageId',
  messageIdParam: ':messageId',
  dataEntityViewType: 'dataEntityViewType',
  dataEntityViewTypeParam: ':dataEntityViewType',
  testReportViewType: 'testReportViewType',
  testReportViewTypeParam: ':testReportViewType',
  versionId: 'versionId',
  versionIdParam: ':versionId',
  overview: 'overview',
  lineage: 'lineage',
  structure: 'structure',
  structureViewType: 'structureViewType',
  structureViewTypeParam: ':structureViewType',
  structureCompare: 'compare',
  testReports: 'test-reports',
  history: 'history',
  alerts: 'alerts',
  linkedEntities: 'linked-entities',
  queryExamples: 'query-examples',
  activity: 'activity',
  discussions: 'discussions',
  createMessage: 'createMessage',
  retries: 'retries',
} as const;

export const TermsRoutes = {
  termSearch: 'termsearch',
  terms: 'terms',
  termSearchId: 'termSearchId',
  termSearchIdParam: ':termSearchId',
  termId: 'termId',
  termIdParam: ':termId',
  termsViewType: 'termsViewType',
  termsViewTypeParam: ':termsViewType',
  overview: 'overview',
  linkedEntities: 'linked-entities',
  linkedColumns: 'linked-columns',
} as const;

export const DirectoryRoutes = {
  directory: 'directory',
  dataSourceTypePrefix: 'dataSourceTypePrefix',
  dataSourceTypePrefixParam: ':dataSourceTypePrefix',
  dataSourceId: 'dataSourceId',
  dataSourceIdParam: ':dataSourceId',
  typeId: 'typeId',
  typeIdParam: ':typeId',
} as const;

export const DataQualityRoutes = {
  dataQuality: 'data-quality',
} as const;
