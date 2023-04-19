import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { createDataEntitiesSearch, updateDataEntitiesSearch } from 'redux/thunks';
import { useAppPaths } from 'lib/hooks';
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
  const navigate = useNavigate();
  const { searchPath } = useAppPaths();

  const storedSearchId = useAppSelector(getSearchId);
  const searchQuery = useAppSelector(getSearchQuery);

  React.useEffect(() => {
    const clearSearchQuery = () => {
      if (mainSearch) dispatch(updateSearchQuery(''));
    };

    return clearSearchQuery();
  }, [mainSearch]);

  const createSearch = React.useCallback((query: string) => {
    const searchFormData = { query, pageSize: 30, filters: {} };

    dispatch(createDataEntitiesSearch({ searchFormData }))
      .unwrap()
      .then(({ searchId }) => {
        const searchLink = searchPath(searchId);
        navigate(searchLink);
      });
  }, []);

  const updateSearch = React.useCallback(
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
          createSearch(query);
          return;
        }
        updateSearch(query);
      }
    },
    [updateSearch, createSearch, mainSearch]
  );

  const defaultPlaceholder =
    'Search data tables, feature groups, jobs and ML models via keywords';

  return (
    <Box sx={{ width: '100%', maxWidth: '640px' }}>
      <SearchSuggestionsAutocomplete
        linkedOption
        inputParams={{
          size: 'large',
          placeholder: placeholder || defaultPlaceholder,
          showSearchAdornment: true,
          searchAdornmentHandler: mainSearch ? createSearch : updateSearch,
          onKeyDownHandler: handleKeyDown,
        }}
        disableSuggestions={disableSuggestions}
        searchQuery={searchQuery}
      />
    </Box>
  );
};

export default MainSearchInput;
