import { generatePath, useParams } from 'react-router-dom';
import type { DataEntity } from 'generated-sources';

const BASE_PATH = 'dataentities';
const DATA_ENTITY_ID_PARAM = ':dataEntityId';
const DATA_ENTITY_ID = 'dataEntityId';
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
} as const;

interface DataEntityDetailsRouteParams {
  [DATA_ENTITY_ID]: string;
}

interface AppDataEntityDetailsRouteParams {
  [DATA_ENTITY_ID]: number;
}

type DataEntityDetailsRoutesType = typeof DataEntityDetailsRoutes;

export const useDataEntityRouteParams = (): AppDataEntityDetailsRouteParams => {
  const { dataEntityId } = useParams<
    keyof DataEntityDetailsRouteParams
  >() as DataEntityDetailsRouteParams;

  return {
    dataEntityId: parseInt(dataEntityId, 10),
  };
};

export function dataEntityDetailsPath(
  dataEntityId: DataEntity['id'],
  path?: DataEntityDetailsRoutesType[keyof DataEntityDetailsRoutesType]
) {
  let originalPath = `${BASE_PATH}/${DATA_ENTITY_ID_PARAM}`;
  if (path) {
    originalPath = `${BASE_PATH}/${DATA_ENTITY_ID_PARAM}/${path}`;
  }
  return generatePath(originalPath, { dataEntityId });
}
