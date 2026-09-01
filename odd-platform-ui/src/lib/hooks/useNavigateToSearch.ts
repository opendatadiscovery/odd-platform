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
/**
 * The canonical param-URL for a (partial) search state — the single construction both the imperative
 * navigator below and any `<Link to=…>` share, so a hook-written URL, a link-written URL and the `Search.tsx`
 * mirror's URL are byte-identical (the mirror's equality loop-guard depends on that).
 */
export function buildSearchLink(state: Partial<SearchUrlState> = {}): string {
  const params = searchStateToParams({ query: '', facets: {}, ...state });
  return `${searchPath()}${params ? `?${params}` : ''}`;
}

export default function useNavigateToSearch() {
  const navigate = useNavigate();

  return useCallback(
    (state: Partial<SearchUrlState> = {}) => {
      navigate(buildSearchLink(state));
    },
    [navigate]
  );
}
