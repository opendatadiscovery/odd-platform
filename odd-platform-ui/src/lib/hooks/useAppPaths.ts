import { useLocation } from 'react-router-dom';
import { AlertViewType, ManagementViewType } from 'lib/interfaces';

const useAppPaths = () => {
  const location = useLocation();
  const isPathEmbedded = location.pathname.includes('embedded');
  const updatePath = (link: string) => {
    if (isPathEmbedded) return `/embedded${link}`;
    return link;
  };

  // search
  const searchPath = (searchId?: string) =>
    updatePath(`/search${searchId ? `/${searchId}` : ''}`);

  // terms
  const termSearchPath = (termSearchId?: string) =>
    updatePath(`/termsearch${termSearchId ? `/${termSearchId}` : ''}`);

  const termDetailsPath = (termId: number) => updatePath(`/terms/${termId}`);

  const termDetailsLinkedItemsPath = (termId: number) =>
    `${termDetailsPath(termId)}/linked-items`;

  const termDetailsOverviewPath = (termId: number) =>
    `${termDetailsPath(termId)}/overview`;

  // dataentity paths
  const dataEntityDetailsPath = (entityId: number) =>
    updatePath(`/dataentities/${entityId}`);

  const dataEntityOverviewPath = (entityId: number) =>
    `${dataEntityDetailsPath(entityId)}/overview`;

  const dataEntityLineagePath = (entityId: number) =>
    `${dataEntityDetailsPath(entityId)}/lineage`;

  const dataEntityTestReportPath = (entityId: number) =>
    `${dataEntityDetailsPath(entityId)}/test-reports`;

  const dataEntityTestPath = (entityId: number, testId: number) =>
    `${dataEntityTestReportPath(entityId)}/${testId}`;

  const dataEntityHistoryPath = (entityId: number) =>
    `${dataEntityDetailsPath(entityId)}/history`;

  const dataEntityAlertsPath = (entityId: number) =>
    `${dataEntityDetailsPath(entityId)}/alerts`;

  const dataEntityLinkedItemsPath = (entityId: number) =>
    `${dataEntityDetailsPath(entityId)}/linked-items`;

  const dataEntityActivityPath = (entityId: number, query?: string) =>
    `${dataEntityDetailsPath(entityId)}/activity?${query}`;

  // Test reports details
  const testReportDetailsOverviewPath = (entityId: number, testId: number) =>
    `${dataEntityTestPath(entityId, testId)}/overview`;

  const testReportDetailsHistoryPath = (entityId: number, testId: number) =>
    `${dataEntityTestPath(entityId, testId)}/history`;

  const testReportDetailsRetriesPath = (entityId: number, testId: number) =>
    `${dataEntityTestPath(entityId, testId)}/retries`;

  // Entity type specific paths
  const datasetStructurePath = (entityId: number, versionId?: number) =>
    `${dataEntityDetailsPath(entityId)}/structure${versionId ? `/${versionId}` : ''}`;

  // Alerts
  const alertsPath = (viewType: AlertViewType = 'all') =>
    updatePath(`/alerts/${viewType}`);

  // Management page
  const managementPath = (viewType: ManagementViewType = 'namespaces') =>
    updatePath(`/management/${viewType}`);

  // Activity
  const activityPath = (query: string) => updatePath(`/activity?${query}`);

  return {
    isPathEmbedded,
    searchPath,
    dataEntityDetailsPath,
    termSearchPath,
    dataEntityOverviewPath,
    datasetStructurePath,
    dataEntityLineagePath,
    dataEntityTestReportPath,
    dataEntityHistoryPath,
    dataEntityAlertsPath,
    dataEntityLinkedItemsPath,
    dataEntityActivityPath,
    termDetailsPath,
    termDetailsLinkedItemsPath,
    termDetailsOverviewPath,
    dataEntityTestPath,
    testReportDetailsOverviewPath,
    testReportDetailsHistoryPath,
    testReportDetailsRetriesPath,
    alertsPath,
    managementPath,
    activityPath,
  };
};

export default useAppPaths;
