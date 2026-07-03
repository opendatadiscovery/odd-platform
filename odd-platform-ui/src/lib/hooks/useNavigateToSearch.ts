import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchStateToParams, type SearchUrlState } from 'lib/search/searchUrlState';
import { searchPath } from 'routes';

/**
 * Navigate to the canonical param-URL search (ADR D10 — the URL is the source of truth), building the query
 * string from a (partial) `SearchUrlState`. An empty/absent state yields a clean `/search`.
 *
 * Replaces `useCreateSearch`, which created an ephemeral `/search/{sessionId}` URL. On a session URL the
 * ST-1b facet re-fetch effects (`Search.tsx` reader + mirror) early-return, so a facet toggle mutated the
 * slice but never re-queried — the dead-filter bug (#1835 ST-1c). The W4 home navigators (`TopTagsList`,
 * `DataEntitiesUsageInfo`, `ToolbarTabs`) use this hook so a search started from the landing page lands on
 * the working `/search?…` flow, where filtering works. The navigate construction mirrors `Search.tsx`'s
 * own facet→URL mirror so a navigator-written URL and a mirror-written URL are byte-identical.
 */
export default function useNavigateToSearch() {
  const navigate = useNavigate();

  return useCallback(
    (state: Partial<SearchUrlState> = {}) => {
      const params = searchStateToParams({
        query: '',
        facets: {},
        myObjects: false,
        ...state,
      });
      navigate(`${searchPath()}${params ? `?${params}` : ''}`);
    },
    [navigate]
  );
}
