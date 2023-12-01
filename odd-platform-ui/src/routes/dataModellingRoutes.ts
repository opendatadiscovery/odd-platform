import { generatePath } from 'react-router-dom';

export const URLSearchParams = {
  QUERY_SEARCH_ID: 'querySearchId',
} as const;

const DataModellingRoutes = {
  BASE_PATH: 'data-modelling',
  QUERY_EXAMPLES_PATH: 'query-examples',
} as const;

type DataModellingRoutesType = Omit<typeof DataModellingRoutes, 'BASE_PATH'>;

export function dataModellingPath(
  path?: DataModellingRoutesType[keyof DataModellingRoutesType]
) {
  if (!path) return generatePath(DataModellingRoutes.BASE_PATH);
  return generatePath(`${DataModellingRoutes.BASE_PATH}/${path}`);
}

const QueryExampleRoutes = {
  ID: ':queryExampleId',
} as const;

export function queryExamplePath(queryExampleId: string) {
  return generatePath(`${dataModellingPath('query-examples')}/${QueryExampleRoutes.ID}`, {
    queryExampleId,
  });
}
