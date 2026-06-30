import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { paramsToSearchState } from 'lib/search/searchUrlState';
import { useDebouncedCallback } from 'use-debounce';
import mapValues from 'lodash/mapValues';
import values from 'lodash/values';
import { useTranslation } from 'react-i18next';
import {
  AppErrorPage,
  MainSearch,
  PageWithLeftSidebar,
  SearchSessionExpired,
} from 'components/shared/elements';
import {
  createDataEntitiesSearch,
  getDataEntitiesSearch,
  updateDataEntitiesSearch,
} from 'redux/thunks';
import {
  getSearchCreatingStatuses,
  getSearchError,
  getSearchFacetsData,
  getSearchFacetsSynced,
  getSearchFetchStatuses,
  getSearchId,
  getSearchMyObjects,
  getSearchQuery,
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
  // ST-1 / ADR D10 — one fresh session per /search visit, then updated as the URL query changes.
  const sessionCreatedRef = React.useRef(false);
  const ranQueryRef = React.useRef<string>('');

  const searchId = useAppSelector(getSearchId);
  const searchQuery = useAppSelector(getSearchQuery);
  const searchMyObjects = useAppSelector(getSearchMyObjects);
  const searchFacetParams = useAppSelector(getSearchFacetsData);
  const searchFacetsSynced = useAppSelector(getSearchFacetsSynced);
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

  // ST-1 / ADR D10 — the URL is the source of truth for the search query. On /search[?q=…] (NOT a legacy
  // /search/{sessionId} deep-link, which is loaded by the effect below — D9), run the search from the URL
  // query: create exactly one fresh session per visit, then UPDATE it whenever the URL query changes
  // (a new committed query, or browser back/forward). This replaces the old unconditional empty-session
  // create and dissolves the "Enter before the session exists" race (navigation no longer needs a session).
  const urlQuery = React.useMemo(
    () => paramsToSearchState(location.search).query,
    [location.search]
  );

  React.useEffect(() => {
    if (routerSearchId) return; // a legacy /search/{sessionId} deep-link is loaded by the effect below (D9)
    if (isSearchCreating) return; // a create is already in flight — wait for it
    const searchFormData = { query: urlQuery, pageSize: 30, filters: {} };
    if (!sessionCreatedRef.current) {
      sessionCreatedRef.current = true;
      ranQueryRef.current = urlQuery;
      dispatch(createDataEntitiesSearch({ searchFormData }));
    } else if (ranQueryRef.current !== urlQuery && searchId) {
      ranQueryRef.current = urlQuery;
      dispatch(updateDataEntitiesSearch({ searchId, searchFormData }));
    }
  }, [urlQuery, routerSearchId, searchId, isSearchCreating, dispatch]);

  React.useEffect(() => {
    if (!searchId && routerSearchId) {
      dispatch(getDataEntitiesSearch({ searchId: routerSearchId }));
    }
  }, [searchId, routerSearchId]);

  const updateSearchFacets = React.useCallback(
    useDebouncedCallback(
      () => {
        const searchFormData = {
          query: searchQuery,
          myObjects: searchMyObjects,
          filters: mapValues(searchFacetParams, values),
        };

        dispatch(updateDataEntitiesSearch({ searchId, searchFormData }));
      },
      1500,
      { leading: true }
    ),
    [searchId, searchFacetParams]
  );

  React.useEffect(() => {
    if (!searchFacetsSynced) {
      updateSearchFacets();
    }
  }, [searchFacetParams]);

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
