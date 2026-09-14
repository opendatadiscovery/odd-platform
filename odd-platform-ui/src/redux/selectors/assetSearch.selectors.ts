import { createSelector } from '@reduxjs/toolkit';
import type { AssetSearchHighlight } from 'generated-sources';
import type { AssetSearchPageInfo, AssetSearchState, RootState } from 'redux/interfaces';
import { highlightKey } from 'lib/search/highlightMarkers';
import {
  createErrorSelector,
  createStatusesSelector,
} from 'redux/selectors/loader-selectors';
import * as actions from 'redux/actions';

const assetSearchState = ({ assetSearch }: RootState): AssetSearchState => assetSearch;

export const getAssetSearchFetchingStatuses = createStatusesSelector(
  actions.searchAssetsActionType
);

export const getAssetSearchError = createErrorSelector(actions.searchAssetsActionType);

export const getAssetSearchResults = createSelector(
  assetSearchState,
  search => search.results.items
);

export const getAssetSearchResultsPageInfo = createSelector(
  assetSearchState,
  (search): AssetSearchPageInfo => search.results.pageInfo
);

// ST-12 (#1846) — one row's "why it matched" (undefined until its tooltip fetched it) + the fetch statuses.
export const getAssetSearchHighlight = (assetKind: string, assetId: number) =>
  createSelector(
    assetSearchState,
    (search): AssetSearchHighlight | undefined =>
      search.highlightByKey[highlightKey(assetKind, assetId)]
  );

export const getAssetSearchHighlightFetchingStatuses = createStatusesSelector(
  actions.fetchAssetSearchHighlightActionType
);
