import React from 'react';
import { useDebouncedCallback } from 'use-debounce';
import mapValues from 'lodash/mapValues';
import values from 'lodash/values';
import { useNavigate } from 'react-router-dom';
import {
  AppErrorPage,
  PageWithLeftSidebar,
  SearchSessionExpired,
} from 'components/shared/elements';
import {
  getTermSearchCreateStatuses,
  getTermSearchError,
  getTermSearchFacetsParams,
  getTermSearchFacetsSynced,
  getTermSearchFetchStatuses,
  getTermSearchId,
  getTermSearchQuery,
} from 'redux/selectors';
import { createTermSearch, getTermsSearch, updateTermSearch } from 'redux/thunks';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { Permission } from 'generated-sources';
import { WithPermissionsProvider } from 'components/shared/contexts';
import { termsSearchPath, useTermsRouteParams } from 'routes';
import { resetLoaderByAction } from 'redux/slices/loader.slice';
import * as actions from 'redux/actions';
import TermSearchFilters from './TermSearchFilters/TermSearchFilters';
import TermSearchResults from './TermSearchResults/TermSearchResults';
import TermSearchHeader from './TermSearchHeader/TermSearchHeader';

const TermSearch: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { termSearchId: routerTermSearchId } = useTermsRouteParams();

  const termSearchId = useAppSelector(getTermSearchId);
  const termSearchQuery = useAppSelector(getTermSearchQuery);
  const termSearchFacetParams = useAppSelector(getTermSearchFacetsParams);
  const termSearchFacetsSynced = useAppSelector(getTermSearchFacetsSynced);
  const { isLoading: isTermSearchCreating } = useAppSelector(getTermSearchCreateStatuses);
  const { isNotLoaded: isTermSearchNotLoaded } = useAppSelector(
    getTermSearchFetchStatuses
  );
  const termSearchError = useAppSelector(getTermSearchError);

  // Mirror of the catalog search dead-link handling (#1760): a deep-linked term-search
  // session that 404s is an expired link, not a platform fault.
  const isDeepLinkNotLoaded =
    !termSearchId && !!routerTermSearchId && isTermSearchNotLoaded;
  const isTermSearchSessionExpired =
    isDeepLinkNotLoaded && termSearchError?.status === 404;

  const handleStartNewTermSearch = React.useCallback(() => {
    dispatch(resetLoaderByAction(actions.getTermsSearchActType));
    dispatch(createTermSearch({ termSearchFormData: { query: '', filters: {} } }))
      .unwrap()
      .then(termSearch => {
        navigate(termsSearchPath(termSearch.searchId));
      });
  }, [dispatch, navigate]);

  React.useEffect(() => {
    if (!routerTermSearchId && !isTermSearchCreating && !termSearchId) {
      const termSearchFormData = { query: '', pageSize: 30, filters: {} };
      dispatch(createTermSearch({ termSearchFormData }))
        .unwrap()
        .then(termSearch => {
          navigate(termSearch.searchId);
        });
    }
  }, [routerTermSearchId, createTermSearch, isTermSearchCreating]);

  React.useEffect(() => {
    if (!termSearchId && routerTermSearchId)
      dispatch(getTermsSearch({ searchId: routerTermSearchId }));
  }, [termSearchId, routerTermSearchId]);

  const updateSearchFacets = React.useCallback(
    useDebouncedCallback(
      () => {
        const termSearchFormData = {
          query: termSearchQuery,
          filters: mapValues(termSearchFacetParams, values),
        };

        dispatch(updateTermSearch({ searchId: termSearchId, termSearchFormData }));
      },
      1500,
      { leading: true }
    ),
    [termSearchId, termSearchFacetParams]
  );

  React.useEffect(() => {
    if (!termSearchFacetsSynced) updateSearchFacets();
  }, [termSearchFacetParams]);

  if (isTermSearchSessionExpired) {
    return <SearchSessionExpired onStartNewSearch={handleStartNewTermSearch} />;
  }

  if (isDeepLinkNotLoaded) {
    return <AppErrorPage showError error={termSearchError} />;
  }

  return (
    <PageWithLeftSidebar.MainContainer>
      <PageWithLeftSidebar.ContentContainer container spacing={2}>
        <PageWithLeftSidebar.LeftSidebarContainer item xs={3}>
          <TermSearchFilters />
        </PageWithLeftSidebar.LeftSidebarContainer>
        <PageWithLeftSidebar.ListContainer item xs={9}>
          <WithPermissionsProvider
            allowedPermissions={[Permission.TERM_CREATE]}
            resourcePermissions={[]}
          >
            <TermSearchHeader />
          </WithPermissionsProvider>
          <TermSearchResults />
        </PageWithLeftSidebar.ListContainer>
      </PageWithLeftSidebar.ContentContainer>
    </PageWithLeftSidebar.MainContainer>
  );
};

export default TermSearch;
