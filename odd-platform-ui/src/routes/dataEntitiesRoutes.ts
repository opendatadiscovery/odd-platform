// the current routing is implemented in a very sophisticated way to manage.
// TODO: let's find a better way by using generic react-router helpers like generatePath.
//  I believe we don't need all of those extra path helpers.
import { generatePath } from 'react-router-dom';

const DataEntitiesRoutes = {
  BASE_PATH: 'dataentities',
} as const;

const DataEntityDetailsRoutes = {
  ID: ':dataEntityId',
  OVERVIEW_PATH: 'overview',
  LINEAGE_PATH: 'lineage',
  ALERTS_PATH: 'alerts',
  TEST_REPORTS_PATH: 'test-reports',
  HISTORY_PATH: 'history',
  ACTIVITY_PATH: 'activity',
  DISCUSSIONS_PATH: 'discussions',
  QUERY_EXAMPLES_PATH: 'query-examples',
  LINKED_ENTITIES_PATH: 'linked-entities',
  STRUCTURE_PATH: 'structure',
} as const;

type DataEntityDetailsRoutesType = Omit<typeof DataEntityDetailsRoutes, 'ID'>;

export function dataEntityDetailsPath(
  dataEntityId: string,
  path?: DataEntityDetailsRoutesType[keyof DataEntityDetailsRoutesType]
) {
  let originalPath = `${DataEntitiesRoutes.BASE_PATH}/${DataEntityDetailsRoutes.ID}`;
  if (path) {
    originalPath = `${DataEntitiesRoutes.BASE_PATH}/${DataEntityDetailsRoutes.ID}/${path}`;
  }
  return generatePath(originalPath, { dataEntityId });
}
