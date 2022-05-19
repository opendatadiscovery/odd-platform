import React from 'react';
import { useDebouncedCallback } from 'use-debounce';
import mapValues from 'lodash/mapValues';
import values from 'lodash/values';
import {
  TermApiGetTermSearchFacetListRequest,
  TermApiTermSearchRequest,
  TermApiUpdateTermSearchFacetsRequest,
  TermSearchFacetsData,
} from 'generated-sources';
import { TermSearchFacetsByName } from 'redux/interfaces/termSearch';
import { ErrorState, FetchStatus } from 'redux/interfaces/loader';
import TermMainSearchContainer from 'components/Terms/TermSearch/TermMainSearch/TermMainSearchContainer';
import AppErrorPage from 'components/shared/AppErrorPage/AppErrorPage';
import { termSearchPath } from 'lib/paths';
import { useHistory } from 'react-router-dom';
import TermSearchFiltersContainer from 'components/Terms/TermSearch/TermSearchFilters/TermSearchFiltersContainer';
import AppButton from 'components/shared/AppButton/AppButton';
import AddIcon from 'components/shared/Icons/AddIcon';
import {
  TermSearchWrapper,
  TermSearchContentWrapper,
  TermSearchFiltersWrapper,
  TermSearchResultsWrapper,
  TermSearchCaption,
} from './TermSearchStyles';
import TermsForm from './TermForm/TermsForm';
import TermsResultsContainer from './TermSearchResults/TermSearchResultsContainer';

interface TermsProps {
  termSearchIdParam?: string;
  termSearchId: string;
  termSearchQuery: string;
  termSearchFacetParams: TermSearchFacetsByName;
  termSearchFacetsSynced: boolean;
  termSearchFetchStatus: FetchStatus;
  termSearchError?: ErrorState;
  getTermSearchDetails: (
    params: TermApiGetTermSearchFacetListRequest
  ) => void;
  updateTermSearch: (params: TermApiUpdateTermSearchFacetsRequest) => void;
  createTermSearch: (
    params: TermApiTermSearchRequest
  ) => Promise<TermSearchFacetsData>;
  isTermSearchCreating: boolean;
}

const TermSearch: React.FC<TermsProps> = ({
  termSearchIdParam,
  termSearchId,
  termSearchQuery,
  termSearchFacetParams,
  termSearchFacetsSynced,
  termSearchFetchStatus,
  termSearchError,
  getTermSearchDetails,
  updateTermSearch,
  createTermSearch,
  isTermSearchCreating,
}) => {
  const history = useHistory();
  React.useEffect(() => {
    if (!termSearchIdParam && !isTermSearchCreating && !termSearchId) {
      const emptySearchQuery = {
        query: '',
        pageSize: 30,
        filters: {},
      };
      createTermSearch({ termSearchFormData: emptySearchQuery }).then(
        termSearch => {
          const termSearchLink = termSearchPath(termSearch.searchId);
          history.replace(termSearchLink);
        }
      );
    }
  }, [termSearchIdParam, createTermSearch, isTermSearchCreating]);

  React.useEffect(() => {
    if (!termSearchId && termSearchIdParam) {
      getTermSearchDetails({
        searchId: termSearchIdParam,
      });
    }
  }, [termSearchId, termSearchIdParam]);

  const updateSearchFacets = React.useCallback(
    useDebouncedCallback(
      () => {
        updateTermSearch({
          searchId: termSearchId,
          termSearchFormData: {
            query: termSearchQuery,
            filters: mapValues(termSearchFacetParams, values),
          },
        });
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
    <>
      <TermSearchWrapper>
        <TermSearchContentWrapper container spacing={2}>
          <TermSearchFiltersWrapper item xs={3}>
            <TermSearchFiltersContainer />
          </TermSearchFiltersWrapper>
          <TermSearchResultsWrapper item xs={9}>
            <TermSearchCaption>
              <TermMainSearchContainer />
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
            </TermSearchCaption>
            <TermsResultsContainer />
          </TermSearchResultsWrapper>
        </TermSearchContentWrapper>
      </TermSearchWrapper>
      <AppErrorPage
        fetchStatus={termSearchFetchStatus}
        error={termSearchError}
      />
    </>
  );
};

export default TermSearch;
