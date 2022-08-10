import React from 'react';
import { useDebouncedCallback } from 'use-debounce';
import mapValues from 'lodash/mapValues';
import values from 'lodash/values';
import { MainSearch } from 'components/shared';
import { useHistory } from 'react-router-dom';
import * as S from 'components/shared/StyledComponents/PageWithLeftSidebar';
import { useAppPaths } from 'lib/hooks/useAppPaths';
import { useAppDispatch, useAppSelector } from 'lib/redux/hooks';
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
import { useAppParams } from 'lib/hooks';
import FiltersContainer from './Filters/FiltersContainer';
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
  const { isLoading: isSearchCreating } = useAppSelector(
    getSearchCreatingStatuses
  );

  React.useEffect(() => {
    if (!routerSearchId && !isSearchCreating && !searchId) {
      const emptySearchQuery = {
        query: '',
        pageSize: 30,
        filters: {},
      };
      dispatch(
        createDataEntitiesSearch({ searchFormData: emptySearchQuery })
      )
        .unwrap()
        .then(search => {
          const searchLink = searchPath(search.searchId);
          history.replace(searchLink);
        });
    }
  }, [routerSearchId, isSearchCreating]);

  React.useEffect(() => {
    if (!searchId && routerSearchId) {
      dispatch(
        getDataEntitiesSearch({
          searchId: routerSearchId,
        })
      );
    }
  }, [searchId, routerSearchId]);

  const updateSearchFacets = React.useCallback(
    useDebouncedCallback(
      () => {
        dispatch(
          updateDataEntitiesSearch({
            searchId,
            searchFormData: {
              query: searchQuery,
              myObjects: searchMyObjects,
              filters: mapValues(searchFacetParams, values),
            },
          })
        );
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
    <S.MainContainer>
      <S.ContentContainer container spacing={2}>
        <S.LeftSidebarContainer item xs={3}>
          <FiltersContainer />
        </S.LeftSidebarContainer>
        <S.ListContainer item xs={9}>
          <MainSearch placeholder="Search" />
          <Results />
        </S.ListContainer>
      </S.ContentContainer>
    </S.MainContainer>
  );
};

export default Search;
