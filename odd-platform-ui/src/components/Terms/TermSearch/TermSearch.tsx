import React from 'react';
import { useDebouncedCallback } from 'use-debounce';
import mapValues from 'lodash/mapValues';
import values from 'lodash/values';
import { useHistory } from 'react-router-dom';
import { AppButton, PageWithLeftSidebar } from 'components/shared';
import { AddIcon } from 'components/shared/Icons';
import { Grid } from '@mui/material';
import { useAppPaths } from 'lib/hooks/useAppPaths';
import { useAppParams } from 'lib/hooks';
import { useAppDispatch, useAppSelector } from 'lib/redux/hooks';
import {
  getTermSearchCreateStatuses,
  getTermSearchFacetsParams,
  getTermSearchFacetsSynced,
  getTermSearchId,
  getTermSearchQuery,
} from 'redux/selectors';
import {
  createTermSearch,
  getTermsSearch,
  updateTermSearch,
} from 'redux/thunks';
import TermSearchFilters from './TermSearchFilters/TermSearchFilters';
import TermMainSearch from './TermMainSearch/TermMainSearch';
import TermsSearchResults from './TermSearchResults/TermSearchResults';
import TermsForm from './TermForm/TermsForm';

const TermSearch: React.FC = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const { termSearchPath } = useAppPaths();
  const { termSearchId: routerTermSearchId } = useAppParams();

  const termSearchId = useAppSelector(getTermSearchId);
  const termSearchQuery = useAppSelector(getTermSearchQuery);
  const termSearchFacetParams = useAppSelector(getTermSearchFacetsParams);
  const termSearchFacetsSynced = useAppSelector(getTermSearchFacetsSynced);
  const { isLoading: isTermSearchCreating } = useAppSelector(
    getTermSearchCreateStatuses
  );

  React.useEffect(() => {
    if (!routerTermSearchId && !isTermSearchCreating && !termSearchId) {
      const emptySearchQuery = {
        query: '',
        pageSize: 30,
        filters: {},
      };
      dispatch(createTermSearch({ termSearchFormData: emptySearchQuery }))
        .unwrap()
        .then(termSearch => {
          const termSearchLink = termSearchPath(termSearch.searchId);
          history.replace(termSearchLink);
        });
    }
  }, [routerTermSearchId, createTermSearch, isTermSearchCreating]);

  React.useEffect(() => {
    if (!termSearchId && routerTermSearchId) {
      dispatch(getTermsSearch({ searchId: routerTermSearchId }));
    }
  }, [termSearchId, routerTermSearchId]);

  const updateSearchFacets = React.useCallback(
    useDebouncedCallback(
      () => {
        dispatch(
          updateTermSearch({
            searchId: termSearchId,
            termSearchFormData: {
              query: termSearchQuery,
              filters: mapValues(termSearchFacetParams, values),
            },
          })
        );
      },
      1500,
      { leading: true }
    ),
    [termSearchId, termSearchFacetParams]
  );

  React.useEffect(() => {
    if (!termSearchFacetsSynced) {
      updateSearchFacets();
    }
  }, [termSearchFacetParams]);

  return (
    <PageWithLeftSidebar.MainContainer>
      <PageWithLeftSidebar.ContentContainer container spacing={2}>
        <PageWithLeftSidebar.LeftSidebarContainer item xs={3}>
          <TermSearchFilters />
        </PageWithLeftSidebar.LeftSidebarContainer>
        <PageWithLeftSidebar.ListContainer item xs={9}>
          <Grid
            container
            justifyContent="space-between"
            alignItems="center"
          >
            <TermMainSearch />
            <TermsForm
              btnCreateEl={
                <AppButton
                  size="large"
                  color="primary"
                  startIcon={<AddIcon />}
                >
                  Add term
                </AppButton>
              }
            />
          </Grid>
          <TermsSearchResults />
        </PageWithLeftSidebar.ListContainer>
      </PageWithLeftSidebar.ContentContainer>
    </PageWithLeftSidebar.MainContainer>
  );
};

export default TermSearch;
