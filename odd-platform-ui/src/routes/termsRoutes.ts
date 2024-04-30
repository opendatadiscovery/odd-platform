import { generatePath, useParams } from 'react-router-dom';
import type { Term } from 'generated-sources';

const BASE_PATH = '/terms';
const TERMS_SEARCH_PATH = '/termsearch';

const TERMS_SEARCH_ID = 'termSearchId';
const TERMS_SEARCH_ID_PARAM = `:${TERMS_SEARCH_ID}`;
const TERM_ID = 'termId';
const TERM_ID_PARAM = `:${TERM_ID}`;

export function termsSearchPath(searchId?: string) {
  if (searchId) {
    return generatePath(`${TERMS_SEARCH_PATH}/${TERMS_SEARCH_ID_PARAM}`, {
      [TERMS_SEARCH_ID]: searchId,
    });
  }
  return TERMS_SEARCH_PATH;
}

export function termsPath() {
  return BASE_PATH;
}

const TermDetailsRoutes = {
  OVERVIEW: 'overview',
  LINKED_ENTITIES: 'linked-entities',
  LINKED_COLUMNS: 'linked-columns',
  LINKED_TERMS: 'linked-terms',
  QUERY_EXAMPLES: 'query-examples',
} as const;

type TermDetailsRoutesType = (typeof TermDetailsRoutes)[keyof typeof TermDetailsRoutes];

export function termDetailsPath(
  termId: Term['id'],
  path: TermDetailsRoutesType = 'overview'
) {
  return generatePath(`${BASE_PATH}/${TERM_ID_PARAM}/${path}`, {
    [TERM_ID]: String(termId),
  });
}

interface TermsRouteParams {
  [TERM_ID]: string;
  [TERMS_SEARCH_ID]: string;
}

interface AppTermsRouteParams {
  [TERM_ID]: Term['id'];
  [TERMS_SEARCH_ID]: string;
}

export const useTermsRouteParams = (): AppTermsRouteParams => {
  const { termId, termSearchId } = useParams<
    keyof TermsRouteParams
  >() as TermsRouteParams;

  return {
    termId: parseInt(termId, 10),
    termSearchId,
  };
};
