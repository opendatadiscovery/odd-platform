import React, { type FC, useCallback, useEffect } from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { updateDataEntitiesSearch } from 'redux/thunks';
import { useCreateSearch } from 'lib/hooks';
import { getSearchId, getSearchQuery } from 'redux/selectors';
import { updateSearchQuery } from 'redux/slices/dataEntitySearch.slice';
import SearchSuggestionsAutocomplete from 'components/shared/elements/Autocomplete/SearchSuggestionsAutocomplete/SearchSuggestionsAutocomplete';

interface AppSearchProps {
  placeholder?: string;
  disableSuggestions?: boolean;
  mainSearch?: boolean;
}

const MainSearchInput: FC<AppSearchProps> = ({
  placeholder,
  disableSuggestions,
  mainSearch,
}) => {
  const dispatch = useAppDispatch();
  const createSearch = useCreateSearch();
  const { t } = useTranslation();

  const storedSearchId = useAppSelector(getSearchId);
  const searchQuery = useAppSelector(getSearchQuery);

  useEffect(() => {
    const clearSearchQuery = () => {
      if (mainSearch) dispatch(updateSearchQuery(''));
    };

    return clearSearchQuery();
  }, [mainSearch]);

  const handleCreateSearch = useCallback((query: string) => {
    const searchFormData = { query, pageSize: 30, filters: {} };
    createSearch(searchFormData);
  }, []);

  const handleUpdateSearch = useCallback(
    (query: string) => {
      const searchFormData = { query, pageSize: 30, filters: {} };
      dispatch(updateDataEntitiesSearch({ searchId: storedSearchId, searchFormData }));
    },
    [storedSearchId, updateDataEntitiesSearch]
  );

  const handleKeyDown = useCallback(
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

  const mainSearchPlaceholder = t('main search placeholder');

  return (
    <Box sx={{ width: '100%', maxWidth: '640px' }}>
      <SearchSuggestionsAutocomplete
        linkedOption
        inputParams={{
          variant: 'search-lg',
          placeholder: placeholder ?? mainSearchPlaceholder,
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
