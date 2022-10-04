import React from 'react';
import { useHistory } from 'react-router-dom';
import { SearchSuggestionsAutocomplete } from 'components/shared';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { createDataEntitiesSearch, updateDataEntitiesSearch } from 'redux/thunks';
import { useAppPaths } from 'lib/hooks';
import { getSearchId, getSearchQuery } from 'redux/selectors';
import { Box } from '@mui/material';
import { updateSearchQuery } from 'redux/slices/dataEntitySearch.slice';

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
  const history = useHistory();
  const { searchPath } = useAppPaths();

  const storedSearchId = useAppSelector(getSearchId);
  const searchQuery = useAppSelector(getSearchQuery);

  React.useEffect(() => {
    const clearSearchQuery = () => {
      if (mainSearch) dispatch(updateSearchQuery(''));
    };

    return clearSearchQuery();
  }, [dispatch, updateSearchQuery]);

  const createSearch = React.useCallback(
    (query: string) => {
      const searchFormData = { query, pageSize: 30, filters: {} };

      dispatch(createDataEntitiesSearch({ searchFormData }))
        .unwrap()
        .then(({ searchId }) => {
          const searchLink = searchPath(searchId);
          history.replace(searchLink);
        });

      history.push(searchPath());
    },
    [createDataEntitiesSearch, searchPath, history]
  );

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
