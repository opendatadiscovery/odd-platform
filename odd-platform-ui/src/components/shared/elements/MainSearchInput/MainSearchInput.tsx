import React from 'react';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { updateDataEntitiesSearch } from 'redux/thunks';
import { useCreateSearch } from 'lib/hooks';
import { getSearchId, getSearchQuery } from 'redux/selectors';
import { Box } from '@mui/material';
import { updateSearchQuery } from 'redux/slices/dataEntitySearch.slice';
import SearchSuggestionsAutocomplete from 'components/shared/elements/Autocomplete/SearchSuggestionsAutocomplete/SearchSuggestionsAutocomplete';

interface AppSearchProps {
  placeholder?: string;
  disableSuggestions?: boolean;
  mainSearch?: boolean;
}

const MainSearchInput: React.FC<AppSearchProps> = ({
  placeholder,
  disableSuggestions,
  mainSearch,
}) => {
  const dispatch = useAppDispatch();
  const createSearch = useCreateSearch();

  const storedSearchId = useAppSelector(getSearchId);
  const searchQuery = useAppSelector(getSearchQuery);

  React.useEffect(() => {
    const clearSearchQuery = () => {
      if (mainSearch) dispatch(updateSearchQuery(''));
    };

    return clearSearchQuery();
  }, [mainSearch]);

  const handleCreateSearch = React.useCallback((query: string) => {
    const searchFormData = { query, pageSize: 30, filters: {} };
    createSearch(searchFormData);
  }, []);

  const handleUpdateSearch = React.useCallback(
    (query: string) => {
      const searchFormData = { query, pageSize: 30, filters: {} };
      dispatch(updateDataEntitiesSearch({ searchId: storedSearchId, searchFormData }));
    },
    [storedSearchId, updateDataEntitiesSearch]
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => (query: string) => {
      if (event.key === 'Enter') {
        if (mainSearch) {
          handleCreateSearch(query);
          return;
        }
        handleUpdateSearch(query);
      }
    },
    [handleUpdateSearch, handleCreateSearch, mainSearch]
  );

  const defaultPlaceholder =
    'Search data tables, feature groups, jobs and ML models via keywords';

  return (
    <Box sx={{ width: '100%', maxWidth: '640px' }}>
      <SearchSuggestionsAutocomplete
        linkedOption
        inputParams={{
          variant: 'search-lg',
          placeholder: placeholder || defaultPlaceholder,
          searchAdornmentHandler: mainSearch ? handleCreateSearch : handleUpdateSearch,
          onKeyDownHandler: handleKeyDown,
        }}
        disableSuggestions={disableSuggestions}
        searchQuery={searchQuery}
      />
    </Box>
  );
};

export default MainSearchInput;
