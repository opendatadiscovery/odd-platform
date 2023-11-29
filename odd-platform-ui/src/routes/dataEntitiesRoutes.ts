// the current routing is implemented in a very sophisticated way to manage.
// TODO: let's find a better way by using generic react-router helpers like generatePath.
//  I believe we don't need all of those extra path helpers.
export const DataEntitiesRoutes = {
  BASE_PATH: 'dataentities/:dataEntityId',
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
