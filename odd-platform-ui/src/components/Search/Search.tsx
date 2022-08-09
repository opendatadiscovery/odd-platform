import React from 'react';
import { useDebouncedCallback } from 'use-debounce';
import mapValues from 'lodash/mapValues';
import values from 'lodash/values';
import { SearchFacetsByName } from 'redux/interfaces/dataEntitySearch';
import MainSearchContainer from 'components/shared/MainSearch/MainSearchContainer';
import { useHistory } from 'react-router-dom';
import * as S from 'components/shared/StyledComponents/PageWithLeftSidebar';
import { useAppPaths } from 'lib/hooks/useAppPaths';
import { useAppDispatch, useAppSelector } from 'lib/redux/hooks';
import {
  createDataEntitiesSearch,
  getDataEntitiesSearch,
  updateDataEntitiesSearch,
} from 'redux/thunks';
import { getSearchCreatingStatuses } from 'redux/selectors';
import FiltersContainer from './Filters/FiltersContainer';
import ResultsContainer from './Results/ResultsContainer';

interface SearchProps {
  searchIdParam?: string;
  searchId: string;
  searchQuery: string;
  searchMyObjects: boolean;
  searchFacetParams: SearchFacetsByName;
  searchFacetsSynced: boolean;
  // searchFetchStatus: FetchStatus;
  // searchError?: ErrorState;
  // isSearchCreating: boolean;
}

const Search: React.FC<SearchProps> = ({
  searchIdParam,
  searchId,
  searchQuery,
  searchMyObjects,
  searchFacetParams,
  searchFacetsSynced,
  // searchFetchStatus,
  // searchError,
  // isSearchCreating,
}) => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const { searchPath } = useAppPaths();

  const { isLoading: isSearchCreating } = useAppSelector(
    getSearchCreatingStatuses
  );

  React.useEffect(() => {
    if (!searchIdParam && !isSearchCreating && !searchId) {
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
    // TODO do we need createDataEntitiesSearch deps?
  }, [searchIdParam, createDataEntitiesSearch, isSearchCreating]);

  React.useEffect(() => {
    if (!searchId && searchIdParam) {
      dispatch(
        getDataEntitiesSearch({
          searchId: searchIdParam,
        })
      );
    }
  }, [searchId, searchIdParam]);

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
          <MainSearchContainer placeholder="Search" />
          <ResultsContainer />
        </S.ListContainer>
      </S.ContentContainer>
    </S.MainContainer>
  );
};

export default Search;
