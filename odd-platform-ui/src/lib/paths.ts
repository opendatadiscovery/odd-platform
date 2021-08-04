import { AlertViewType } from 'redux/interfaces';

export const searchPath = (searchId?: string) =>
  `/search${searchId ? `/${searchId}` : ''}`;

export const dataSourcesPath = () => '/datasources';

export const tagsPath = () => '/tags';

export const dataEntityDetailsPath = (entityId: number) =>
  `/dataentities/${entityId}`;

export const dataEntityMetadataPath = (entityId: number) =>
  `${dataEntityDetailsPath(entityId)}/metadata`;

export const dataEntityOverviewPath = (datasetId: number) =>
  `${dataEntityDetailsPath(datasetId)}/overview`;

export const dataEntityLineagePath = (datasetId: number) =>
  `${dataEntityDetailsPath(datasetId)}/lineage`;

export const dataEntityTestReportPath = (datasetId: number) =>
  `${dataEntityDetailsPath(datasetId)}/test-reports`;

export const dataEntityTestPath = (datasetId: number, testId: number) =>
  `${dataEntityTestReportPath(datasetId)}/${testId}`;

export const dataEntityAlertsPath = (datasetId: number) =>
  `${dataEntityDetailsPath(datasetId)}/alerts`;

// Test reports details
export const testReportDetailsOverviewPath = (
  datasetId: number,
  testId: number
) => `${dataEntityTestPath(datasetId, testId)}/overview`;

export const testReportDetailsHistoryPath = (
  datasetId: number,
  testId: number
) => `${dataEntityTestPath(datasetId, testId)}/history`;

export const testReportDetailsRetriesPath = (
  datasetId: number,
  testId: number
) => `${dataEntityTestPath(datasetId, testId)}/retries`;

// Entity type specific paths
export const datasetStructurePath = (
  datasetId: number,
  versionId?: number
) =>
  `${dataEntityDetailsPath(datasetId)}/structure${
    versionId ? `/${versionId}` : ''
  }`;

// DataEntityAlerts
export const alertsPath = (viewType: AlertViewType = 'all') =>
  `/alerts/${viewType}`;
