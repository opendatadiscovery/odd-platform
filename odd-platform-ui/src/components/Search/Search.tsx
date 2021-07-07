import React from 'react';
import { Grid } from '@material-ui/core';
import { useDebouncedCallback } from 'use-debounce/lib';
import { mapValues, values } from 'lodash';
import {
  SearchApiUpdateSearchFacetsRequest,
  SearchApiGetSearchFacetListRequest,
} from 'generated-sources';
import { SearcFacetsByName } from 'redux/interfaces/search';
import MainSearchContainer from 'components/shared/MainSearch/MainSearchContainer';
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
  getDataEntitiesSearchDetails: (
    params: SearchApiGetSearchFacetListRequest
  ) => void;
  updateDataEntitiesSearch: (
    params: SearchApiUpdateSearchFacetsRequest
  ) => void;
}

const Search: React.FC<SearchProps> = ({
  classes,
  searchIdParam,
  searchId,
  searchQuery,
  searchMyObjects,
  searchFilterParams,
  searchFiltersSynced,
  getDataEntitiesSearchDetails,
  updateDataEntitiesSearch,
}) => {
  React.useEffect(() => {
    if (!searchId && searchIdParam) {
      getDataEntitiesSearchDetails({
        searchId: searchIdParam,
      });
    }
  }, [searchId, searchIdParam]);

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
      {searchId ? (
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
      ) : null}
    </>
  );
};

export default Search;
