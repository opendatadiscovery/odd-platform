import { generatePath, useParams } from 'react-router-dom';
import type { DataEntity, DataQualityTest } from 'generated-sources';

const BASE_PATH = '/dataentities';
const DataEntityDetailsRoutes = {
  OVERVIEW: 'overview',
  LINEAGE: 'lineage',
  ALERTS: 'alerts',
  TEST_REPORTS: 'test-reports',
  HISTORY: 'history',
  ACTIVITY: 'activity',
  DISCUSSIONS: 'discussions',
  QUERY_EXAMPLES: 'query-examples',
  LINKED_ENTITIES: 'linked-entities',
  STRUCTURE: 'structure',
  DATA: 'data',
  RELATIONSHIPS: 'relationships',
} as const;

const DATA_ENTITY_ID_PARAM = ':dataEntityId';
const DATA_ENTITY_ID = 'dataEntityId';
const DATA_QA_TEST_ID_PARAM = ':dataQATestId';
const DATA_QA_TEST_ID = 'dataQATestId';
const VERSION_ID_PARAM = ':versionId';
const VERSION_ID = 'versionId';
const MESSAGE_ID_PARAM = ':messageId';
const MESSAGE_ID = 'messageId';
const FIELD_ID_PARAM = ':fieldId';
const FIELD_ID = 'fieldId';

interface DataEntityDetailsRouteParams {
  [DATA_ENTITY_ID]: string;
  [DATA_QA_TEST_ID]: string;
  [VERSION_ID]: string;
  [MESSAGE_ID]: string;
  [FIELD_ID]: string;
}

interface AppDataEntityDetailsRouteParams {
  [DATA_ENTITY_ID]: number;
  [DATA_QA_TEST_ID]: number;
  [VERSION_ID]: number;
  [MESSAGE_ID]: string;
  [FIELD_ID]: number;
}

export const useDataEntityRouteParams = (): AppDataEntityDetailsRouteParams => {
  const { dataEntityId, dataQATestId, versionId, messageId, fieldId } = useParams<
    keyof DataEntityDetailsRouteParams
  >() as DataEntityDetailsRouteParams;

  return {
    dataEntityId: parseInt(dataEntityId, 10),
    dataQATestId: parseInt(dataQATestId, 10),
    versionId: parseInt(versionId, 10),
    messageId,
    fieldId: parseInt(fieldId, 10),
  };
};

type DataEntityDetailsRoutesType = typeof DataEntityDetailsRoutes;

export function dataEntitiesPath() {
  return BASE_PATH;
}
export function dataEntityDetailsPath(
  id: DataEntity['id'] | string,
  path: DataEntityDetailsRoutesType[keyof DataEntityDetailsRoutesType] = 'overview'
) {
  return generatePath(`${BASE_PATH}/${DATA_ENTITY_ID_PARAM}/${path}`, {
    dataEntityId: String(id),
  });
}

export function dataEntityTestReportsPath(
  id: DataEntity['id'] | string,
  dataQATestId?: DataQualityTest['id'] | string,
  path: 'overview' | 'history' = 'overview'
) {
  const detailsPath = dataEntityDetailsPath(id, DataEntityDetailsRoutes.TEST_REPORTS);
  if (dataQATestId) {
    return generatePath(`${detailsPath}/${DATA_QA_TEST_ID_PARAM}/${path}`, {
      dataQATestId: String(dataQATestId),
    });
  }
  return dataEntityDetailsPath(id, DataEntityDetailsRoutes.TEST_REPORTS);
}

export function dataEntityLineagePath(id: DataEntity['id'] | string, query?: string) {
  const detailsPath = dataEntityDetailsPath(id, DataEntityDetailsRoutes.LINEAGE);
  const queryString = query ? `?${query}` : '';
  return `${detailsPath}${queryString}`;
}

export function datasetStructurePath(id: DataEntity['id'] | string, versionId?: number) {
  const detailsPath = dataEntityDetailsPath(id, DataEntityDetailsRoutes.STRUCTURE);
  if (versionId) {
    return generatePath(`${detailsPath}/overview/${VERSION_ID_PARAM}`, {
      versionId: String(versionId),
    });
  }

  return dataEntityDetailsPath(id, DataEntityDetailsRoutes.STRUCTURE);
}

export function datasetStructureFieldPath(
  id: DataEntity['id'] | string,
  fieldId: number
) {
  const detailsPath = dataEntityDetailsPath(id, DataEntityDetailsRoutes.STRUCTURE);
  return generatePath(`${detailsPath}/overview/field/${FIELD_ID_PARAM}`, {
    fieldId: String(fieldId),
  });
}

export function datasetStructureComparePath(
  id: DataEntity['id'] | string,
  firstVersionId: number,
  secondVersionId: number
) {
  const detailsPath = dataEntityDetailsPath(id, DataEntityDetailsRoutes.STRUCTURE);
  const queryString = `?firstVersionId=${firstVersionId}&secondVersionId=${secondVersionId}`;
  return `${detailsPath}/compare${queryString}`;
}

export function dataEntityDiscussionsPath(
  id: DataEntity['id'] | string,
  messageId: string
) {
  const detailsPath = dataEntityDetailsPath(id, DataEntityDetailsRoutes.DISCUSSIONS);
  return generatePath(`${detailsPath}/${MESSAGE_ID_PARAM}`, {
    messageId,
  });
}
