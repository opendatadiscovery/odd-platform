import React from 'react';
import { useDebouncedCallback } from 'use-debounce';
import mapValues from 'lodash/mapValues';
import values from 'lodash/values';
import { useNavigate } from 'react-router-dom';
import { PageWithLeftSidebar } from 'components/shared/elements';
import { useAppParams } from 'lib/hooks';
import {
  getTermSearchCreateStatuses,
  getTermSearchFacetsParams,
  getTermSearchFacetsSynced,
  getTermSearchId,
  getTermSearchQuery,
} from 'redux/selectors';
import { createTermSearch, getTermsSearch, updateTermSearch } from 'redux/thunks';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { Permission } from 'generated-sources';
import { WithPermissionsProvider } from 'components/shared/contexts';
import TermSearchFilters from './TermSearchFilters/TermSearchFilters';
import TermsSearchResults from './TermSearchResults/TermSearchResults';
import TermSearchHeader from './TermSearchHeader/TermSearchHeader';

const TermSearch: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { termSearchId: routerTermSearchId } = useAppParams();

  const termSearchId = useAppSelector(getTermSearchId);
  const termSearchQuery = useAppSelector(getTermSearchQuery);
  const termSearchFacetParams = useAppSelector(getTermSearchFacetsParams);
  const termSearchFacetsSynced = useAppSelector(getTermSearchFacetsSynced);
  const { isLoading: isTermSearchCreating } = useAppSelector(getTermSearchCreateStatuses);

  React.useEffect(() => {
    if (!routerTermSearchId && !isTermSearchCreating && !termSearchId) {
      const termSearchFormData = { query: '', pageSize: 30, filters: {} };
      dispatch(createTermSearch({ termSearchFormData }))
        .unwrap()
        .then(termSearch => {
          navigate(`${termSearch.searchId}`);
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
          <TermsSearchResults />
        </PageWithLeftSidebar.ListContainer>
      </PageWithLeftSidebar.ContentContainer>
    </PageWithLeftSidebar.MainContainer>
  );
};

export default TermSearch;
