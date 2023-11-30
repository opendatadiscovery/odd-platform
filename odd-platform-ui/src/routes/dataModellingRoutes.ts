export const URLSearchParams = {
  QUERY_SEARCH_ID: 'querySearchId',
} as const;

export const DataModellingRoutes = {
  BASE_PATH: 'data-modelling',
  QUERY_EXAMPLES_PATH: 'query-examples',
  QUERY_EXAMPLE_PATH: 'query-examples/:queryExampleId',
  QUERY_EXAMPLE_ID: 'queryExampleId',
  QUERY_EXAMPLE_ID_PARAM: ':queryExampleId',
} as const;
