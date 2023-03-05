import type { DataEntity, DataQualityTest } from 'generated-sources';
import { useIsEmbeddedPath } from './useIsEmbeddedPath';
import { DataEntityRoutes } from './shared';

type DataEntityId = DataEntity['id'] | string;
type TestId = DataQualityTest['id'] | string;

export const useDataEntityPaths = () => {
  const { updatePath } = useIsEmbeddedPath();

  // const dataEntityBasePath = () => updatePath(`/${DataEntityRoutes.dataEntity}`);
  const dataEntityDetailsPath = (
    entityId: DataEntityId = DataEntityRoutes.dataEntityId,
    viewType: string = DataEntityRoutes.viewType
  ) => updatePath(`/${DataEntityRoutes.dataentities}/${entityId}/${viewType}`);

  const dataEntityLineagePath = (
    entityId: DataEntityId = DataEntityRoutes.dataEntityId,
    query = ''
  ) =>
    `${dataEntityDetailsPath(entityId, DataEntityRoutes.lineage)}${
      query ? `?${query}` : ''
    }`;

  const dataEntityHistoryPath = (
    entityId: DataEntityId = DataEntityRoutes.dataEntityId
  ) => `${dataEntityDetailsPath(entityId, DataEntityRoutes.history)}`;

  const dataEntityOverviewPath = (
    entityId: DataEntityId = DataEntityRoutes.dataEntityId
  ) => `${dataEntityDetailsPath(entityId, DataEntityRoutes.overview)}`;

  const dataEntityAlertsPath = (entityId: DataEntityId = DataEntityRoutes.dataEntityId) =>
    `${dataEntityDetailsPath(entityId, DataEntityRoutes.alerts)}`;

  const dataEntityActivityPath = (
    entityId: DataEntityId = DataEntityRoutes.dataEntityId,
    query?: string
  ) =>
    `${dataEntityDetailsPath(entityId, DataEntityRoutes.activity)}${
      query ? `?${query}` : ''
    }`;

  const dataEntityLinkedItemsPath = (
    entityId: DataEntityId = DataEntityRoutes.dataEntityId
  ) => `${dataEntityDetailsPath(entityId, DataEntityRoutes.linkedItems)}`;

  const datasetStructurePath = (
    entityId: DataEntityId = DataEntityRoutes.dataEntityId,
    versionId?: number
  ) =>
    `${dataEntityDetailsPath(entityId, DataEntityRoutes.structure)}${
      versionId ? `/${versionId}` : ''
    }`;

  const dataEntityCollaborationPath = (
    entityId: DataEntityId = DataEntityRoutes.dataEntityId
  ) => `${dataEntityDetailsPath(entityId, DataEntityRoutes.collaboration)}`;

  const dataEntityCollaborationMessagePath = (
    entityId: DataEntityId = DataEntityRoutes.dataEntityId,
    messageId: string = DataEntityRoutes.messageId
  ) => `${dataEntityDetailsPath(entityId, DataEntityRoutes.collaboration)}/${messageId}`;

  const dataEntityCollaborationCreateMessagePath = (
    entityId: DataEntityId = DataEntityRoutes.dataEntityId
  ) =>
    `${dataEntityDetailsPath(entityId, DataEntityRoutes.collaboration)}/${
      DataEntityRoutes.createMessage
    }`;

  const dataEntityTestReportPath = (
    entityId: DataEntityId = DataEntityRoutes.dataEntityId
  ) => `${dataEntityDetailsPath(entityId, DataEntityRoutes.testReports)}`;

  const dataEntityTestPath = (
    entityId: DataEntityId = DataEntityRoutes.dataEntityId,
    testId: TestId = DataEntityRoutes.dataQATestId,
    viewType: string = DataEntityRoutes.viewType
  ) =>
    `${dataEntityDetailsPath(
      entityId,
      DataEntityRoutes.testReports
    )}/${testId}/${viewType}`;

  // Test reports details
  const testReportDetailsOverviewPath = (
    entityId: DataEntityId = DataEntityRoutes.dataEntityId,
    testId: TestId = DataEntityRoutes.dataQATestId
  ) => `${dataEntityTestPath(entityId, testId, DataEntityRoutes.overview)}`;

  const testReportDetailsHistoryPath = (
    entityId: DataEntityId = DataEntityRoutes.dataEntityId,
    testId: TestId = DataEntityRoutes.dataQATestId
  ) => `${dataEntityTestPath(entityId, testId, DataEntityRoutes.history)}`;

  return {
    dataEntityDetailsPath,
    dataEntityTestPath,
    dataEntityLineagePath,
    dataEntityActivityPath,
    datasetStructurePath,
    dataEntityCollaborationMessagePath,
    dataEntityCollaborationCreateMessagePath,
    testReportDetailsOverviewPath,
    testReportDetailsHistoryPath,
    dataEntityHistoryPath,
    dataEntityOverviewPath,
    dataEntityTestReportPath,
    dataEntityCollaborationPath,
    dataEntityAlertsPath,
    dataEntityLinkedItemsPath,
  };
};
