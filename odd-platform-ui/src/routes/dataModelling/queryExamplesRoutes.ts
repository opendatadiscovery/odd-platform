import { generatePath, useParams } from 'react-router-dom';
import type { QueryExample } from 'generated-sources';
import { BASE_PATH } from './dataModelling';

export const URLSearchParams = {
  QUERY_SEARCH_ID: 'querySearchId',
} as const;

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
  const path = `${BASE_PATH}/query-examples`;
  if (queryExampleId) {
    return generatePath(`${path}/:queryExampleId`, {
      queryExampleId: queryExampleId.toString(),
    });
  }

  return generatePath(path);
}
