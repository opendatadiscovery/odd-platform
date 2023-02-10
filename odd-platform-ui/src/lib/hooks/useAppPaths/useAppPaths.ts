import React from 'react';
import type { AlertViewType } from 'lib/interfaces';
import { useIsEmbeddedPath } from './useIsEmbeddedPath';
import { useManagementPaths } from './useManagementPaths';

const useAppPaths = () => {
  const { updatePath, isPathEmbedded } = useIsEmbeddedPath();
  const managementPaths = useManagementPaths();
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

  const dataEntityLineagePath = (entityId: number, query: string) =>
    `${dataEntityDetailsPath(entityId)}/lineage?${query}`;

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

  const dataEntityCollaborationPath = (entityId: number) =>
    `${dataEntityDetailsPath(entityId)}/collaboration`;

  const dataEntityCollaborationMessagePath = (entityId: number, messageId: string) =>
    `${dataEntityDetailsPath(entityId)}/collaboration/${messageId}`;

  const dataEntityCollaborationCreateMessagePath = (entityId: number) =>
    `${dataEntityDetailsPath(entityId)}/collaboration/createMessage`;

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

  // Activity
  const activityPath = (query: string) => updatePath(`/activity?${query}`);

  return React.useMemo(
    () => ({
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
      activityPath,
      dataEntityCollaborationPath,
      dataEntityCollaborationMessagePath,
      dataEntityCollaborationCreateMessagePath,
      ...managementPaths,
    }),
    [isPathEmbedded, managementPaths]
  );
};

export default useAppPaths;
