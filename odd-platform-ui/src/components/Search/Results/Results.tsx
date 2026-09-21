import React from 'react';
import { Grid } from '@mui/material';
import { useLocation } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useTranslation } from 'react-i18next';
import { DataEntityClassNameEnum, Permission } from 'generated-sources';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { useRecentlyViewedHistoryEmpty, useResultColumns } from 'lib/hooks';
import {
  getAssetSearchError,
  getAssetSearchFetchingStatuses,
  getAssetSearchResults,
  getAssetSearchResultsPageInfo,
  getSearchCreatingStatuses,
  getSearchEntityClass,
  getSearchFacetsSynced,
  getSearchId,
  getSearchTotals,
  getSearchUpdateStatuses,
} from 'redux/selectors';
import { fetchFavoritesStatus, searchAssets } from 'redux/thunks';
import {
  AppErrorPage,
  Button,
  EmptyContentPlaceholder,
} from 'components/shared/elements';
import { AddIcon } from 'components/shared/icons';
import { WithPermissions } from 'components/shared/contexts';
import { useSearchRouteParams } from 'routes';
import {
  paramsToSearchState,
  searchStateKeyWithoutColumns,
  searchUrlStateToAssetSearchFormData,
} from 'lib/search/searchUrlState';
import { serverFieldsFor } from 'lib/search/resultColumns';
import { favoriteAssetId } from 'components/Favorites/lib';
import TableHeader from './TableHeader/TableHeader';
import DataEntityGroupForm from '../../DataEntityDetails/DataEntityGroup/DataEntityGroupForm/DataEntityGroupForm';
import SearchResultsHeader from './SearchResultsHeader/SearchResultsHeader';
import SearchSortMenu from './SearchSortMenu/SearchSortMenu';
import SavedSearches from './SavedSearches';
import ResultItem from './ResultItem/ResultItem';
import SearchResultsSkeleton from './SearchResultsSkeleton/SearchResultsSkeleton';
import ColumnsPicker from './ColumnsPicker/ColumnsPicker';
import * as S from './Results.styles';

const Results: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const size = 30;

  // ST-2b — the global sort dropdown (+ saved searches) are param-URL controls (ADR D10), hidden on the
  // deprecated legacy `/search/{sessionId}` route where writing `?sort=` would navigate away from the session.
  const { searchId: routerSearchId } = useSearchRouteParams();

  // ST-4 — the RESULTS list is the cross-kind asset search (rebound from `/api/search` to the stateless
  // `/api/search/assets`). The facet sidebar still reads the DE-session slice below, so rebinding the list
  // does NOT orphan it (W1).
  const searchResults = useAppSelector(getAssetSearchResults);
  const {
    hasNext,
    lastId: nextCursor,
    total,
    scopeTruncated,
    scopeTruncationReason,
  } = useAppSelector(getAssetSearchResultsPageInfo);
  const { isLoading: isAssetSearchLoading, isNotLoaded: isAssetSearchNotLoaded } =
    useAppSelector(getAssetSearchFetchingStatuses);
  const assetSearchError = useAppSelector(getAssetSearchError);

  // The DE-session slice: still the source for the facet sidebar (W1). The tab strip it also used to
  // drive is gone (ST-8); `searchClass` now only decides whether the Create-Data-Entity-Group button shows.
  const searchId = useAppSelector(getSearchId);
  const searchClass = useAppSelector(getSearchEntityClass);
  const searchTotals = useAppSelector(getSearchTotals);
  const searchFiltersSynced = useAppSelector(getSearchFacetsSynced);
  const { isLoading: isSearchCreating } = useAppSelector(getSearchCreatingStatuses);
  const { isLoading: isSearchUpdating } = useAppSelector(getSearchUpdateStatuses);

  const [showDEGBtn, setShowDEGBtn] = React.useState(false);

  const isCurrentSearchClass = React.useCallback(
    (totalName: DataEntityClassNameEnum) => searchClass === searchTotals[totalName]?.id,
    [searchClass, searchTotals]
  );

  // ST-13a (#1847) — the result-column layout: ONE owner (this hook, here), passed down as props; the header, rows,
  // skeleton and picker never read the store or the URL themselves (CTRIB-073 R13).
  const resultColumns = useResultColumns();
  const { columns } = resultColumns;
  // The layout's SERVER-resolved subset, as one string: the only part of a column change the request cares about.
  const serverFieldsKey = React.useMemo(
    () => serverFieldsFor(columns).join(','),
    [columns]
  );
  // The search state WITHOUT its layout: the part of the URL a picker action must not re-fire page 1 for.
  const searchKey = React.useMemo(
    () => searchStateKeyWithoutColumns(paramsToSearchState(location.search)),
    [location.search]
  );
  const columnsRef = React.useRef(columns);
  columnsRef.current = columns;

  // The cross-kind request is derived straight from the URL (the search's source of truth — ADR D10): query +
  // facets + sort + asset_kinds + the ST-8 My-data scope and its per-direction depths — plus the ACTIVE layout as
  // `columns` (read through a ref at build time, so the body says what the table shows). The memo is keyed on the
  // columns-less search key + the server-token string: a client-only column toggle (Type / Status / Query) rewrites
  // the URL but neither rebuilds the request nor re-fires page 1; enabling a server-resolved column does (the page
  // needs its values). Page 1 is owned by the settle-effect; scroll extends it.
  const assetSearchFormData = React.useMemo(
    () => ({
      ...searchUrlStateToAssetSearchFormData(paramsToSearchState(location.search)),
      columns: [...columnsRef.current],
    }),
    [searchKey, serverFieldsKey]
  );

  // ST-7 (#1841) — with the Favorites scope on, an empty result is almost always "you have not starred
  // anything (matching this)", not "the catalog has nothing". The retired Favorites tab used its empty state
  // to TEACH the star to a first-time user; a bare "No matches found" here would drop that teaching on the
  // floor, which is how retiring a surface quietly loses a feature. Reuses the tab's exact string (already
  // translated in all 7 locales).
  const isFavoritesScope = React.useMemo(
    () => paramsToSearchState(location.search).favorites === 'yes',
    [location.search]
  );

  // ST-10 (#1844) — with the recency scope on, an empty list has TWO different meanings and a bare "No matches
  // found" tells the user neither. The signal is three-valued on purpose: the recently-viewed slice starts at
  // `total: 0`, so a boolean would announce "you haven't opened any assets yet" to a user who has, for the moment
  // before the request resolves. Both this and the facet read the SAME hook, so they cannot drift.
  const isRecencyScope = React.useMemo(
    () => paramsToSearchState(location.search).recentlyViewed !== undefined,
    [location.search]
  );
  const recencyHistory = useRecentlyViewedHistoryEmpty();

  const emptyText = React.useMemo(() => {
    if (isRecencyScope) {
      // While the probe is in flight, say nothing more specific than the generic line — claiming either recency
      // sentence would be a guess about the user's history.
      if (recencyHistory === 'loading') return t('No matches found');
      return recencyHistory === 'empty'
        ? t("You haven't opened any assets yet. Assets you open will appear here.")
        : t('Nothing you opened matches this range.');
    }
    // ST-7 (#1841) — the retired Favorites tab's teaching empty state.
    return isFavoritesScope ? t('Star an asset to pin it here.') : t('No matches found');
  }, [isRecencyScope, recencyHistory, isFavoritesScope, t]);

  const fetchNextPage = React.useCallback(() => {
    // ST-5b keyset: the first page is fired by the settle-effect (no cursor); scroll extends it by passing
    // back the server's opaque nextCursor. No cursor yet (or no further pages) ⇒ nothing to fetch.
    if (!hasNext || !nextCursor) return;
    dispatch(searchAssets({ cursor: nextCursor, size, assetSearchFormData }));
  }, [hasNext, nextCursor, size, assetSearchFormData, dispatch]);

  // Fetch page 1 once the DE session (the facet sidebar) has settled for the current URL — the same timing
  // gate the DE results used, so the list and the sidebar stay in lockstep. A new URL (query / facet / sort /
  // asset-type) re-creates the session → synced flips → this re-fires page 1 (which REPLACES) for the new state.
  React.useEffect(() => {
    if (searchFiltersSynced && searchId && !isSearchCreating && !isSearchUpdating) {
      dispatch(searchAssets({ size, assetSearchFormData })); // the first page carries no cursor
      setShowDEGBtn(isCurrentSearchClass(DataEntityClassNameEnum.ENTITY_GROUP));
    }
  }, [
    searchFiltersSynced,
    searchId,
    isSearchCreating,
    isSearchUpdating,
    assetSearchFormData,
  ]);

  // Hydrate the favorited status of all visible rows in one batch (all kinds), so each row's star renders
  // without a per-row request. Already-known refs are no-ops in the slice.
  React.useEffect(() => {
    if (searchResults.length === 0) return;
    dispatch(
      fetchFavoritesStatus({
        assetRef: searchResults
          .map(asset => ({ assetKind: asset.assetKind, assetId: favoriteAssetId(asset) }))
          .filter(ref => ref.assetId > 0),
      })
    );
  }, [searchResults, dispatch]);

  // ST-8 (#1842) — the All / My-Objects tab strip is RETIRED. ST-4 removed the seven class tabs (class
  // selection became the Asset-type + Data-entity-type sidebar filters) and this slice removes the last one:
  // "my objects" is now one option in the My-data scope group, alongside its two lineage directions. A
  // one-tab strip is not a control, so the whole surface (and its tab-change handler, which wrote the `my`
  // pseudo-facet) is gone rather than left rendering a single tab.

  const isFirstLoading = isAssetSearchLoading && searchResults.length === 0;

  return (
    <Grid sx={{ mt: 2 }}>
      <WithPermissions permissionTo={Permission.DATA_ENTITY_GROUP_CREATE}>
        {showDEGBtn && (
          <DataEntityGroupForm
            btnCreateEl={
              <Button
                text={t('Add group')}
                sx={{ mt: 2 }}
                buttonType='secondary-m'
                startIcon={<AddIcon />}
              />
            }
          />
        )}
      </WithPermissions>
      {/* ST-3 / #1837 — the saved-search toolbar sits alongside the global sort control, both gated to the
          param-URL search (there is no shareable spec on the legacy `/search/{sessionId}` route). */}
      {!routerSearchId && (
        <Grid container justifyContent='space-between' alignItems='center' wrap='nowrap'>
          <SavedSearches />
          <SearchSortMenu />
        </Grid>
      )}
      {/* ST-8 — the match count + the scope-truncation warning. Deliberately OUTSIDE the `!routerSearchId`
          gate above: the retired tab strip rendered unconditionally, so gating the count would silently
          remove it from the legacy /search/{sessionId} route that ADR D9 keeps alive (IT-125 exercises it). */}
      {/* ST-13a — the count and the Columns picker share the UNGATED header row, so the constructor is available on
          the legacy /search/{sessionId} route too (where it writes the browser's stored layout only). */}
      <Grid container justifyContent='space-between' alignItems='flex-end' wrap='nowrap'>
        <SearchResultsHeader
          total={total}
          isLoading={isFirstLoading}
          scopeTruncated={scopeTruncated}
          scopeTruncationReason={scopeTruncationReason}
        />
        <ColumnsPicker {...resultColumns} />
      </Grid>
      <S.ListContainer id='results-list'>
        <TableHeader columns={columns} />
        {isFirstLoading && <SearchResultsSkeleton columns={columns} />}
        {!isAssetSearchNotLoaded && !isFirstLoading && (
          <>
            <InfiniteScroll
              dataLength={searchResults.length}
              next={fetchNextPage}
              hasMore={hasNext}
              loader={
                isAssetSearchLoading &&
                searchResults.length > 0 && <SearchResultsSkeleton columns={columns} />
              }
              scrollThreshold='200px'
              scrollableTarget='results-list'
              style={{ overflow: 'visible' }}
            >
              {searchResults.map(asset => (
                <ResultItem
                  key={`${asset.assetKind}:${favoriteAssetId(asset)}`}
                  asset={asset}
                  columns={columns}
                />
              ))}
            </InfiniteScroll>
            <EmptyContentPlaceholder
              isContentLoaded={!isAssetSearchLoading}
              isContentEmpty={!searchResults.length}
              text={emptyText}
            />
          </>
        )}
      </S.ListContainer>
      <AppErrorPage
        showError={isAssetSearchNotLoaded}
        error={assetSearchError}
        offsetTop={210}
      />
    </Grid>
  );
};

export default Results;
