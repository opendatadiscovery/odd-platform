import React from 'react';
import { useDebouncedCallback } from 'use-debounce';
import mapValues from 'lodash/mapValues';
import values from 'lodash/values';
import {
  SearchApiGetSearchFacetListRequest,
  SearchApiSearchRequest,
  SearchApiUpdateSearchFacetsRequest,
  SearchFacetsData,
} from 'generated-sources';
import { SearchFacetsByName } from 'redux/interfaces/search';
import { ErrorState, FetchStatus } from 'redux/interfaces/loader';
import MainSearchContainer from 'components/shared/MainSearch/MainSearchContainer';
import AppErrorPage from 'components/shared/AppErrorPage/AppErrorPage';
import { searchPath } from 'lib/paths';
import { useHistory } from 'react-router-dom';
import FiltersContainer from './Filters/FiltersContainer';
import ResultsContainer from './Results/ResultsContainer';
import * as S from './SearchStyles';

interface SearchProps {
  searchIdParam?: string;
  searchId: string;
  searchQuery: string;
  searchMyObjects: boolean;
  searchFacetParams: SearchFacetsByName;
  searchFacetsSynced: boolean;
  searchFetchStatus: FetchStatus;
  searchError?: ErrorState;
  getDataEntitiesSearchDetails: (
    params: SearchApiGetSearchFacetListRequest
  ) => void;
  updateDataEntitiesSearch: (
    params: SearchApiUpdateSearchFacetsRequest
  ) => void;
  createDataEntitiesSearch: (
    params: SearchApiSearchRequest
  ) => Promise<SearchFacetsData>;
  isSearchCreating: boolean;
}

const Search: React.FC<SearchProps> = ({
  searchIdParam,
  searchId,
  searchQuery,
  searchMyObjects,
  searchFacetParams,
  searchFacetsSynced,
  searchFetchStatus,
  searchError,
  getDataEntitiesSearchDetails,
  updateDataEntitiesSearch,
  createDataEntitiesSearch,
  isSearchCreating,
}) => {
  const history = useHistory();
  React.useEffect(() => {
    if (!searchIdParam && !isSearchCreating && !searchId) {
      const emptySearchQuery = {
        query: '',
        pageSize: 30,
        filters: {},
      };
      createDataEntitiesSearch({ searchFormData: emptySearchQuery }).then(
        search => {
          const searchLink = searchPath(search.searchId);
          history.replace(searchLink);
        }
      );
    }
  }, [searchIdParam, createDataEntitiesSearch, isSearchCreating]);

  React.useEffect(() => {
    if (!searchId && searchIdParam) {
      getDataEntitiesSearchDetails({
        searchId: searchIdParam,
      });
    }
  }, [searchId, searchIdParam]);

  const updateSearchFacets = React.useCallback(
    useDebouncedCallback(
      () => {
        updateDataEntitiesSearch({
          searchId,
          searchFormData: {
            query: searchQuery,
            myObjects: searchMyObjects,
            filters: mapValues(searchFacetParams, values),
          },
        });
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
    <>
      <S.Container>
        <S.ContentContainer container spacing={2}>
          <S.FiltersContainer item xs={3}>
            <FiltersContainer />
          </S.FiltersContainer>
          <S.ResultsContainer item xs={9}>
            <MainSearchContainer placeholder="Search" />
            <ResultsContainer />
          </S.ResultsContainer>
        </S.ContentContainer>
      </S.Container>
      <AppErrorPage fetchStatus={searchFetchStatus} error={searchError} />
    </>
  );
};

export default Search;
