import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  paramsToSearchState,
  searchStateToParams,
  searchUrlStateToFormData,
} from 'lib/search/searchUrlState';
import { useDebouncedCallback } from 'use-debounce';
import { useTranslation } from 'react-i18next';
import {
  AppErrorPage,
  MainSearch,
  PageWithLeftSidebar,
  SearchSessionExpired,
} from 'components/shared/elements';
import { createDataEntitiesSearch, getDataEntitiesSearch } from 'redux/thunks';
import {
  getSearchCreatingStatuses,
  getSearchError,
  getSearchFacetsSynced,
  getSearchFetchStatuses,
  getSearchId,
  getSearchUrlState,
} from 'redux/selectors';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { Permission } from 'generated-sources';
import { WithPermissionsProvider } from 'components/shared/contexts';
import { searchPath, useSearchRouteParams } from 'routes';
import { resetLoaderByAction } from 'redux/slices/loader.slice';
import * as actions from 'redux/actions';
import Filters from './Filters/Filters';
import Results from './Results/Results';

const Search: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { searchId: routerSearchId } = useSearchRouteParams();
  const navigate = useNavigate();
  const location = useLocation();

  const searchId = useAppSelector(getSearchId);
  const searchFacetsSynced = useAppSelector(getSearchFacetsSynced);
  const searchUrlState = useAppSelector(getSearchUrlState);
  const { isLoading: isSearchCreating } = useAppSelector(getSearchCreatingStatuses);
  const { isNotLoaded: isSearchNotLoaded } = useAppSelector(getSearchFetchStatuses);
  const searchError = useAppSelector(getSearchError);

  // A deep-linked session that failed to load: 404 = the ephemeral session is gone (expired
  // TTL / foreign link) — a graceful dead-link state, not an error (#1760).
  const isDeepLinkNotLoaded = !searchId && !!routerSearchId && isSearchNotLoaded;
  const isSearchSessionExpired = isDeepLinkNotLoaded && searchError?.status === 404;

  const handleStartNewSearch = React.useCallback(() => {
    dispatch(resetLoaderByAction(actions.getDataEntitySearchActionType));
    navigate(searchPath());
  }, [dispatch, navigate]);

  // ST-1 / ADR D10 — the URL is the source of truth for the whole search (query + facets + myObjects). ST-1b
  // makes it authoritative for FACETS too: the reader CREATEs a fresh session per distinct URL state, because
  // the server's search() runs removeUnselected (a REPLACE), so the URL's selected id set is the complete,
  // authoritative facet spec — a plain updateFacets MERGEs a delta and could never REMOVE a facet the URL
  // dropped (deselect / Clear-All / class-switch). Not a legacy /search/{sessionId} deep-link (loaded by the
  // effect below — D9). `page` is not serialised (infinite scroll — Results.tsx).
  const urlState = React.useMemo(
    () => paramsToSearchState(location.search),
    [location.search]
  );
  const urlStateKey = React.useMemo(() => searchStateToParams(urlState), [urlState]);
  const lastAppliedStateRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (routerSearchId) return; // a legacy /search/{sessionId} deep-link is loaded by the effect below (D9)
    // A create is in flight — defer; this effect re-runs when it clears, so the NEWEST URL state is never
    // lost (load-bearing — do not remove: it serialises overlapping creates from a rapid facet burst).
    if (isSearchCreating) return;
    if (lastAppliedStateRef.current === urlStateKey) return; // this exact URL state already ran
    lastAppliedStateRef.current = urlStateKey;
    const searchFormData = { ...searchUrlStateToFormData(urlState), pageSize: 30 };
    dispatch(createDataEntitiesSearch({ searchFormData }));
  }, [urlStateKey, urlState, routerSearchId, isSearchCreating, dispatch]);

  React.useEffect(() => {
    if (!searchId && routerSearchId) {
      dispatch(getDataEntitiesSearch({ searchId: routerSearchId }));
    }
  }, [searchId, routerSearchId]);

  // ST-1b — the facet→URL mirror. On a LOCAL facet change (isFacetsStateSynced=false, set by every toggle
  // site: the Filters sidebar select/deselect, Clear-All, AND the Results class / My-Objects tabs) write the
  // full search state to the URL, debounced, PUSHed so each committed filter set is a back/forward stop.
  // Reacting to the SLICE (getSearchUrlState) covers every dispatch site without touching them (the round-1
  // census fix). The server response sets synced=true, so the mirror never re-fires on repopulation (no
  // loop); the normalised equality guard skips a redundant navigate. The reader above then runs the new URL.
  const writeStateToUrl = useDebouncedCallback(() => {
    const nextParams = searchStateToParams(searchUrlState);
    if (nextParams !== location.search.replace(/^\?/, '')) {
      navigate(`${searchPath()}${nextParams ? `?${nextParams}` : ''}`);
    }
  }, 400);

  React.useEffect(() => {
    if (routerSearchId) return; // a legacy session deep-link is not mirrored to the param URL (D9)
    if (!searchFacetsSynced) writeStateToUrl();
  }, [searchUrlState, searchFacetsSynced, routerSearchId, writeStateToUrl]);

  if (isSearchSessionExpired) {
    return <SearchSessionExpired onStartNewSearch={handleStartNewSearch} />;
  }

  if (isDeepLinkNotLoaded) {
    return <AppErrorPage showError error={searchError} />;
  }

  return (
    <PageWithLeftSidebar.MainContainer>
      <PageWithLeftSidebar.ContentContainer container>
        <PageWithLeftSidebar.LeftSidebarContainer item xs={3}>
          <Filters />
        </PageWithLeftSidebar.LeftSidebarContainer>
        <PageWithLeftSidebar.ListContainer item xs={9}>
          <MainSearch placeholder={t('Search')} disableSuggestions />
          <WithPermissionsProvider
            allowedPermissions={[Permission.DATA_ENTITY_GROUP_CREATE]}
            resourcePermissions={[]}
            Component={Results}
          />
        </PageWithLeftSidebar.ListContainer>
      </PageWithLeftSidebar.ContentContainer>
    </PageWithLeftSidebar.MainContainer>
  );
};

export default Search;
