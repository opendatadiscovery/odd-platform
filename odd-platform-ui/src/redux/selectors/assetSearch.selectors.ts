import { createSelector } from '@reduxjs/toolkit';
import type { AssetSearchPageInfo, AssetSearchState, RootState } from 'redux/interfaces';
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
