import React from 'react';
import { Grid } from '@material-ui/core';
import { useDebouncedCallback } from 'use-debounce/lib';
import { mapValues, values } from 'lodash';
import {
  SearchApiUpdateSearchFacetsRequest,
  SearchApiGetSearchFacetListRequest,
  SearchApiSearchRequest,
  SearchFacetsData,
} from 'generated-sources';
import { SearcFacetsByName } from 'redux/interfaces/search';
import { FetchStatus, ErrorState } from 'redux/interfaces/loader';
import MainSearchContainer from 'components/shared/MainSearch/MainSearchContainer';
import AppErrorPage from 'components/shared/AppErrorPage/AppErrorPage';
import { searchPath } from 'lib/paths';
import { useHistory } from 'react-router-dom';
import FiltersContainer from './Filters/FiltersContainer';
import ResultsContainer from './Results/ResultsContainer';
import { StylesType } from './SearchStyles';

interface SearchProps extends StylesType {
  searchIdParam?: string;
  searchId: string;
  searchQuery: string;
  searchMyObjects: boolean;
  searchFilterParams: SearcFacetsByName;
  searchFiltersSynced: boolean;
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
  classes,
  searchIdParam,
  searchId,
  searchQuery,
  searchMyObjects,
  searchFilterParams,
  searchFiltersSynced,
  searchFetchStatus,
  searchError,
  getDataEntitiesSearchDetails,
  updateDataEntitiesSearch,
  createDataEntitiesSearch,
  isSearchCreating,
}) => {
  const history = useHistory();
  React.useEffect(() => {
    if (!searchIdParam && !isSearchCreating) {
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
  }, [searchId, searchIdParam, isSearchCreating]);

  const updateSearchFilters = React.useCallback(
    useDebouncedCallback(
      () => {
        updateDataEntitiesSearch({
          searchId,
          searchFormData: {
            query: searchQuery,
            myObjects: searchMyObjects,
            filters: mapValues(searchFilterParams, values),
          },
        });
      },
      1500,
      { leading: true }
    ),
    [searchId, searchFilterParams]
  );

  React.useEffect(() => {
    if (!searchFiltersSynced) {
      updateSearchFilters();
    }
  }, [searchFilterParams]);

  return (
    <>
      <div className={classes.container}>
        <Grid container className={classes.contentContainer} spacing={2}>
          <Grid item xs={3} className={classes.filtersContainer}>
            <FiltersContainer />
          </Grid>
          <Grid item xs={9} className={classes.resultsContainer}>
            <MainSearchContainer
              className={classes.searchInput}
              placeholder="Search"
            />
            <ResultsContainer />
          </Grid>
        </Grid>
      </div>
      <AppErrorPage fetchStatus={searchFetchStatus} error={searchError} />
    </>
  );
};

export default Search;
