import React from 'react';
import type { AlertViewType } from 'lib/interfaces';
import { useIsEmbeddedPath } from './useIsEmbeddedPath';
import { useManagementPaths } from './useManagementPaths';
import { useTermsPaths } from './useTermsPaths';
import { AppRoutesEnum } from './shared';

const useAppPaths = () => {
  const { updatePath, isPathEmbedded } = useIsEmbeddedPath();
  const managementPaths = useManagementPaths();
  const termsPaths = useTermsPaths();

  const basePath = updatePath('/');

  // search
  const baseSearchPath = () => updatePath(`/search`);
  const searchPath = (searchId: string = AppRoutesEnum.searchId) =>
    `${baseSearchPath()}/${searchId}`;

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
      basePath,
      baseSearchPath,
      searchPath,
      dataEntityDetailsPath,
      dataEntityOverviewPath,
      datasetStructurePath,
      dataEntityLineagePath,
      dataEntityTestReportPath,
      dataEntityHistoryPath,
      dataEntityAlertsPath,
      dataEntityLinkedItemsPath,
      dataEntityActivityPath,
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
      ...termsPaths,
    }),
    [isPathEmbedded, managementPaths]
  );
};

export default useAppPaths;
