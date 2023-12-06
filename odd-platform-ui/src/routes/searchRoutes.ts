import { generatePath, useParams } from 'react-router-dom';

const BASE_PATH = '/search';
const SEARCH_ID_PARAM = ':searchId';
const SEARCH_ID = 'searchId';

export function searchPath(searchId?: string) {
  if (searchId) {
    return generatePath(`${BASE_PATH}/${SEARCH_ID_PARAM}`, { [SEARCH_ID]: searchId });
  }
  return BASE_PATH;
}

interface SearchRouteParams {
  [SEARCH_ID]: string;
}

export const useSearchRouteParams = (): SearchRouteParams =>
  useParams<keyof SearchRouteParams>() as SearchRouteParams;
