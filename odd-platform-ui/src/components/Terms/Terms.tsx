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
import FiltersContainer from './TermsFilters/TermsFiltersContainer';
import ResultsContainer from './TermsResults/TermsResultsContainer';
import {
  TermsContainer,
  TermsContentContainer,
  TermsFiltersContainer,
  TermsResultsContainer,
} from './TermsStyles';
import AppButton from '../shared/AppButton/AppButton';
import AddIcon from '../shared/Icons/AddIcon';
import TermsFormContainer from './TermForm/TermsFormContainer';

interface TermsProps {
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

const Terms: React.FC<TermsProps> = ({
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
      <TermsContainer>
        <TermsContentContainer container spacing={2}>
          <TermsFiltersContainer item xs={3}>
            <FiltersContainer />
          </TermsFiltersContainer>
          <TermsResultsContainer item xs={9}>
            <MainSearchContainer placeholder="Search" />
            <TermsFormContainer
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
            <ResultsContainer />
          </TermsResultsContainer>
        </TermsContentContainer>
      </TermsContainer>
      <AppErrorPage fetchStatus={searchFetchStatus} error={searchError} />
    </>
  );
};

export default Terms;
