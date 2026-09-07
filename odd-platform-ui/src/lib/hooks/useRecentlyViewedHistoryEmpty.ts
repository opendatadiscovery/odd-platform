import React from 'react';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { fetchRecentlyViewedList } from 'redux/thunks';
import {
  getRecentlyViewedListFetchingStatuses,
  getRecentlyViewedListPage,
} from 'redux/selectors';

/**
 * Whether the caller has any recently-viewed history at all — THREE-valued, deliberately.
 *
 * ST-10 (#1844) uses this in two places that must agree: the Last-viewed facet (disabled with a reason when there
 * is nothing to scope) and the results area (the teaching empty state). A boolean would collapse "not fetched yet"
 * into "empty", and the recently-viewed slice's initial state is `{ total: 0, page: 0 }` — so on every mount, for
 * the fraction of a second before the request resolves, both surfaces would announce "You haven't opened any assets
 * yet" to a user who has. Hence `'loading'`, and hence ONE hook rather than the same derivation written twice.
 *
 * It shares the slice the home-page panel fills. Its `size: 1` fetch therefore shortens the list that panel holds —
 * harmless, because only `total` is read here and `RecentlyViewedColumn` re-fetches on mount, so do not "fix" it by
 * duplicating the request into a second slice.
 */
export type RecentlyViewedHistoryState = 'loading' | 'empty' | 'has-history';

export default function useRecentlyViewedHistoryEmpty(): RecentlyViewedHistoryState {
  const dispatch = useAppDispatch();
  const pageInfo = useAppSelector(getRecentlyViewedListPage);
  const { isLoaded, isNotLoaded } = useAppSelector(getRecentlyViewedListFetchingStatuses);

  React.useEffect(() => {
    // One identity-scoped probe: the count is all this needs, and the identity comes from the session server-side.
    dispatch(fetchRecentlyViewedList({ page: 1, size: 1 }));
  }, [dispatch]);

  // `page === 0` is the untouched initial state — no response has landed yet. A rejected request is treated as
  // "has history" rather than "empty": announcing an empty history because a request failed would be a lie, and
  // the scope itself still works.
  if (pageInfo.page === 0 || (!isLoaded && !isNotLoaded)) {
    return 'loading';
  }
  return isLoaded && pageInfo.total === 0 ? 'empty' : 'has-history';
}
