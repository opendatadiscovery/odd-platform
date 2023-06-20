import type { DataEntity, DataQualityTest } from 'generated-sources';
import { useIsEmbeddedPath } from './useIsEmbeddedPath';
import { DataEntityRoutes } from './shared';

type DataEntityId = DataEntity['id'] | string;
type TestId = DataQualityTest['id'] | string;

export const useDataEntityPaths = () => {
  const { updatePath } = useIsEmbeddedPath();

  const dataEntityDetailsBasePath = (
    entityId: DataEntityId = DataEntityRoutes.dataEntityId,
    viewType: string = DataEntityRoutes.dataEntityViewTypeParam
  ) => updatePath(`${DataEntityRoutes.dataentities}/${entityId}/${viewType}`);

  const dataEntityLineagePath = (
    entityId: DataEntityId = DataEntityRoutes.dataEntityId,
    query = ''
  ) =>
    `${dataEntityDetailsBasePath(entityId, DataEntityRoutes.lineage)}${
      query ? `?${query}` : ''
    }`;

  const dataEntityHistoryPath = (
    entityId: DataEntityId = DataEntityRoutes.dataEntityId
  ) => `${dataEntityDetailsBasePath(entityId, DataEntityRoutes.history)}`;

  const dataEntityOverviewPath = (
    entityId: DataEntityId = DataEntityRoutes.dataEntityId
  ) => `${dataEntityDetailsBasePath(entityId, DataEntityRoutes.overview)}`;

  const dataEntityAlertsPath = (entityId: DataEntityId = DataEntityRoutes.dataEntityId) =>
    `${dataEntityDetailsBasePath(entityId, DataEntityRoutes.alerts)}`;

  const dataEntityActivityPath = (
    entityId: DataEntityId = DataEntityRoutes.dataEntityId,
    query?: string
  ) =>
    `${dataEntityDetailsBasePath(entityId, DataEntityRoutes.activity)}${
      query ? `?${query}` : ''
    }`;

  const dataEntityLinkedItemsPath = (
    entityId: DataEntityId = DataEntityRoutes.dataEntityId
  ) => `${dataEntityDetailsBasePath(entityId, DataEntityRoutes.linkedItems)}`;

  const datasetStructurePath = (
    viewType: string = DataEntityRoutes.testReportViewTypeParam,
    entityId: DataEntityId = DataEntityRoutes.dataEntityId,
    versionId?: number
  ) =>
    `${dataEntityDetailsBasePath(entityId, DataEntityRoutes.structure)}/${viewType}${
      versionId ? `/${versionId}` : ''
    }`;

  const datasetStructureComparePath = (
    entityId: DataEntityId = DataEntityRoutes.dataEntityId,
    firstVersionId?: number,
    secondVersionId?: number
  ) => {
    const query =
      firstVersionId && secondVersionId
        ? `?firstVersionId=${firstVersionId}&secondVersionId=${secondVersionId}`
        : '';

    return `${dataEntityDetailsBasePath(entityId, DataEntityRoutes.structure)}/${
      DataEntityRoutes.structureCompare
    }${query || ''}`;
  };

  const dataEntityCollaborationPath = (
    entityId: DataEntityId = DataEntityRoutes.dataEntityId
  ) => `${dataEntityDetailsBasePath(entityId, DataEntityRoutes.discussions)}`;

  const dataEntityCollaborationMessagePath = (
    entityId: DataEntityId = DataEntityRoutes.dataEntityId,
    messageId: string = DataEntityRoutes.messageId
  ) =>
    `${dataEntityDetailsBasePath(entityId, DataEntityRoutes.discussions)}/${messageId}`;

  const dataEntityCollaborationCreateMessagePath = (
    entityId: DataEntityId = DataEntityRoutes.dataEntityId
  ) =>
    `${dataEntityDetailsBasePath(entityId, DataEntityRoutes.discussions)}/${
      DataEntityRoutes.createMessage
    }`;

  const dataEntityTestReportPath = (
    entityId: DataEntityId = DataEntityRoutes.dataEntityId
  ) => `${dataEntityDetailsBasePath(entityId, DataEntityRoutes.testReports)}`;

  const dataEntityTestPath = (
    entityId: DataEntityId = DataEntityRoutes.dataEntityId,
    testId: TestId = DataEntityRoutes.dataQATestId,
    viewType: string = DataEntityRoutes.testReportViewTypeParam
  ) =>
    `${dataEntityDetailsBasePath(
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
    datasetStructureComparePath,
  };
};
