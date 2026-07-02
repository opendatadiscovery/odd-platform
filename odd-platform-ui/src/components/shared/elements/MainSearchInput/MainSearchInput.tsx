import React, { type FC, useCallback, useEffect } from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { useQueryParams } from 'lib/hooks';
import { searchPath } from 'routes';
import { getSearchQuery } from 'redux/selectors';
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
  const { t } = useTranslation();
  const { setQueryParams } = useQueryParams<{ q: string }>({ q: '' });

  const searchQuery = useAppSelector(getSearchQuery);

  useEffect(() => {
    const clearSearchQuery = () => {
      if (mainSearch) dispatch(updateSearchQuery(''));
    };

    return clearSearchQuery();
  }, [mainSearch]);

  // ST-1 / ADR D10 — committing a query navigates to the canonical, shareable param URL (/search?q=…)
  // instead of POSTing a session (home hero) or PUTting an existing one (search page). The Search page
  // reads the URL and runs the search; a new history entry is PUSHED so browser back/forward navigates
  // prior query states. Both entry points (home hero + search page) share this single writer.
  // ST-1b — merge q into the CURRENT params via the function updater so a query commit PRESERVES the active
  // facet params in the URL. `prev` is parsed live from location.search (useQueryParams), so `{ q }` alone
  // would replace the params and silently clear the filters (the clobber); the spread keeps them.
  const handleSearch = useCallback(
    (query: string) => {
      setQueryParams(prev => ({ ...prev, q: query }), { pathname: searchPath() });
    },
    [setQueryParams]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => (query: string) => {
      if (event.key === 'Enter') handleSearch(query);
    },
    [handleSearch]
  );

  const mainSearchPlaceholder = t('main search placeholder');

  return (
    <Box sx={{ width: '100%', maxWidth: '640px' }}>
      <SearchSuggestionsAutocomplete
        linkedOption
        inputParams={{
          variant: 'search-lg',
          placeholder: placeholder ?? mainSearchPlaceholder,
          searchAdornmentHandler: handleSearch,
          onKeyDownHandler: handleKeyDown,
        }}
        disableSuggestions={disableSuggestions}
        searchQuery={searchQuery}
      />
    </Box>
  );
};

export default MainSearchInput;
