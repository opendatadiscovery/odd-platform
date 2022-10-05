import React from 'react';
import { useDebouncedCallback } from 'use-debounce';
import mapValues from 'lodash/mapValues';
import values from 'lodash/values';
import { MainSearch, PageWithLeftSidebar } from 'components/shared';
import { useHistory } from 'react-router-dom';
import { useAppParams, useAppPaths } from 'lib/hooks';
import {
  createDataEntitiesSearch,
  getDataEntitiesSearch,
  updateDataEntitiesSearch,
} from 'redux/thunks';
import {
  getSearchCreatingStatuses,
  getSearchFacetsData,
  getSearchFacetsSynced,
  getSearchId,
  getSearchMyObjects,
  getSearchQuery,
} from 'redux/selectors';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import Filters from './Filters/Filters';
import Results from './Results/Results';

const Search: React.FC = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const { searchPath } = useAppPaths();
  const { searchId: routerSearchId } = useAppParams();

  const searchId = useAppSelector(getSearchId);
  const searchQuery = useAppSelector(getSearchQuery);
  const searchMyObjects = useAppSelector(getSearchMyObjects);
  const searchFacetParams = useAppSelector(getSearchFacetsData);
  const searchFacetsSynced = useAppSelector(getSearchFacetsSynced);
  const { isLoading: isSearchCreating } = useAppSelector(getSearchCreatingStatuses);

  React.useEffect(() => {
    if (!routerSearchId && !isSearchCreating && !searchId) {
      const searchFormData = { query: '', pageSize: 30, filters: {} };
      dispatch(createDataEntitiesSearch({ searchFormData }))
        .unwrap()
        .then(search => {
          const searchLink = searchPath(search.searchId);
          history.replace(searchLink);
        });
    }
  }, [routerSearchId, isSearchCreating]);

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

  return (
    <PageWithLeftSidebar.MainContainer>
      <PageWithLeftSidebar.ContentContainer container>
        <PageWithLeftSidebar.LeftSidebarContainer item xs={3}>
          <Filters />
        </PageWithLeftSidebar.LeftSidebarContainer>
        <PageWithLeftSidebar.ListContainer item xs={9}>
          <MainSearch placeholder='Search' disableSuggestions />
          <Results />
        </PageWithLeftSidebar.ListContainer>
      </PageWithLeftSidebar.ContentContainer>
    </PageWithLeftSidebar.MainContainer>
  );
};

export default Search;
