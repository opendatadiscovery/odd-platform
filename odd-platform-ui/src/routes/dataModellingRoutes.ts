import { generatePath, useParams } from 'react-router-dom';
import type { QueryExample } from 'generated-sources';

export const URLSearchParams = {
  QUERY_SEARCH_ID: 'querySearchId',
} as const;

const BASE_PATH = '/data-modelling';
const QUERY_EXAMPLES_PATH = 'query-examples';

export function dataModellingPath() {
  return BASE_PATH;
}

const QUERY_EXAMPLE_ID_PARAM = ':queryExampleId';
const QUERY_EXAMPLE_ID = 'queryExampleId';

interface QueryExamplesRouteParams {
  [QUERY_EXAMPLE_ID]: string;
}

interface AppQueryExamplesRouteParams {
  [QUERY_EXAMPLE_ID]: number;
}

export const useQueryExamplesRouteParams = (): AppQueryExamplesRouteParams => {
  const { queryExampleId } = useParams<
    keyof QueryExamplesRouteParams
  >() as QueryExamplesRouteParams;

  return {
    queryExampleId: parseInt(queryExampleId, 10),
  };
};

export function queryExamplesPath(queryExampleId?: QueryExample['id']) {
  let originalPath = `${BASE_PATH}/${QUERY_EXAMPLES_PATH}`;
  if (!queryExampleId) return generatePath(originalPath);

  originalPath = `${BASE_PATH}/${QUERY_EXAMPLES_PATH}/${QUERY_EXAMPLE_ID_PARAM}`;
  return generatePath(originalPath, { queryExampleId });
}
