import { AlertViewType, ManagementViewType } from 'lib/interfaces';

export const searchPath = (searchId?: string) =>
  `/search${searchId ? `/${searchId}` : ''}`;

export const termDetailsPath = (termId: number) => `/terms/${termId}`;

export const termDetailsLinkedItemsPath = (termId: number) =>
  `${termDetailsPath(termId)}/linked-items`;

export const termDetailsOverviewPath = (termId: number) =>
  `${termDetailsPath(termId)}/overview`;

export const termSearchPath = (termSearchId?: string) =>
  `/termsearch${termSearchId ? `/${termSearchId}` : ''}`;

export const dataEntityDetailsPath = (entityId: number) =>
  `/dataentities/${entityId}`;

export const dataEntityOverviewPath = (entityId: number) =>
  `${dataEntityDetailsPath(entityId)}/overview`;

export const dataEntityLineagePath = (entityId: number) =>
  `${dataEntityDetailsPath(entityId)}/lineage`;

export const dataEntityTestReportPath = (entityId: number) =>
  `${dataEntityDetailsPath(entityId)}/test-reports`;

export const dataEntityTestPath = (entityId: number, testId: number) =>
  `${dataEntityTestReportPath(entityId)}/${testId}`;

export const dataEntityAlertsPath = (entityId: number) =>
  `${dataEntityDetailsPath(entityId)}/alerts`;

export const dataEntityHistoryPath = (entityId: number) =>
  `${dataEntityDetailsPath(entityId)}/history`;

export const dataEntityLinkedItemsPath = (entityId: number) =>
  `${dataEntityDetailsPath(entityId)}/linked-items`;

export const dataEntityActivityPath = (entityId: number, query?: string) =>
  `${dataEntityDetailsPath(entityId)}/activity?${query}`;

// Test reports details
export const testReportDetailsOverviewPath = (
  entityId: number,
  testId: number
) => `${dataEntityTestPath(entityId, testId)}/overview`;

export const testReportDetailsHistoryPath = (
  entityId: number,
  testId: number
) => `${dataEntityTestPath(entityId, testId)}/history`;

export const testReportDetailsRetriesPath = (
  entityId: number,
  testId: number
) => `${dataEntityTestPath(entityId, testId)}/retries`;

// Entity type specific paths
export const datasetStructurePath = (
  entityId: number,
  versionId?: number
) =>
  `${dataEntityDetailsPath(entityId)}/structure${
    versionId ? `/${versionId}` : ''
  }`;

// Alerts
export const alertsPath = (viewType: AlertViewType = 'all') =>
  `/alerts/${viewType}`;

// Management page
export const managementPath = (
  viewType: ManagementViewType = 'namespaces'
) => `/management/${viewType}`;

// DataEntityActivity
export const activityPath = (query: string) => `/activity?${query}`;
