// the current routing is implemented in a very sophisticated way to manage.
// TODO: let's find a better way by using generic react-router helpers like generatePath.
//  I believe we don't need all of those extra path helpers.
export const DataEntitiesRoutes = {
  BASE_PATH: 'dataentities',
  DATA_ENTITY_ID: 'dataEntityId',
  DATA_ENTITY_ID_PARAM: ':dataEntityId',
  QUERY_EXAMPLES_PATH: `:dataEntityId/query-examples`,
} as const;
