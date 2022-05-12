import React from 'react';
import { Typography } from '@mui/material';
import { useHistory } from 'react-router-dom';
import {
  TermApiGetTermSearchSuggestionsRequest,
  TermApiTermSearchRequest,
  TermRefList,
  TermRef,
  TermSearchFacetsData,
} from 'generated-sources';
import { termDetailsOverviewPath, termSearchPath } from 'lib/paths';
import {
  TermMainSearchSuggestionItem,
  TermMainSearchContainer,
  TermMainSearchAutocomplete,
  TermMainSearchSearch,
} from 'components/Terms/TermSearch/TermMainSearch/TermMainSearchStyles';
import { useDebouncedCallback } from 'use-debounce';
import AppTextField from 'components/shared/AppTextField/AppTextField';
import ClearIcon from 'components/shared/Icons/ClearIcon';
import SearchIcon from 'components/shared/Icons/SearchIcon';

interface TermMainSearchProps {
  query?: string;
  suggestions: TermRefList;
  fetchTermSearchSuggestions: (
    params: TermApiGetTermSearchSuggestionsRequest
  ) => Promise<TermRefList>;
  createTermSearch: (
    params: TermApiTermSearchRequest
  ) => Promise<TermSearchFacetsData>;
}

const TermMainSearch: React.FC<TermMainSearchProps> = ({
  query,
  suggestions,
  fetchTermSearchSuggestions,
  createTermSearch,
}) => {
  const [searchText, setSearchText] = React.useState<string>('');
  const [options, setOptions] = React.useState<Partial<TermRef>[]>([]);
  const [autocompleteOpen, setAutocompleteOpen] =
    React.useState<boolean>(false);
  const [loadingSuggestions, setLoadingSuggestions] =
    React.useState<boolean>(false);

  const history = useHistory();

  const createSearch = () => {
    const termSearchQuery = {
      query: searchText,
      pageSize: 30,
      filters: {},
    };
    createTermSearch({ termSearchFormData: termSearchQuery }).then(
      termSearch => {
        const termSearchLink = termSearchPath(termSearch.searchId);
        history.replace(termSearchLink);
      }
    );
    history.push(termSearchPath());
  };

  const handleInputChange = (
    _: React.ChangeEvent<unknown>,
    inputVal: string
  ) => {
    setSearchText(inputVal);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      createSearch();
    }
  };

  const getSuggestions = React.useCallback(
    useDebouncedCallback(() => {
      fetchTermSearchSuggestions({ query: searchText }).then(() => {
        setLoadingSuggestions(false);
      });
    }, 500),
    [
      searchText,
      setOptions,
      setLoadingSuggestions,
      fetchTermSearchSuggestions,
    ]
  );

  React.useEffect(() => {
    setSearchText(query || '');
  }, [query]);

  React.useEffect(() => {
    setOptions(suggestions.items);
  }, [suggestions.items]);

  React.useEffect(() => {
    if (!searchText) return;
    setLoadingSuggestions(autocompleteOpen);
    if (autocompleteOpen) {
      getSuggestions();
    }
  }, [autocompleteOpen, searchText]);

  const getOptionLabel = (option: unknown) => {
    const typedOption = option as TermRef;
    return typedOption.name || '';
  };

  const renderOption = (
    props: React.HTMLAttributes<HTMLLIElement>,
    option: unknown
  ): React.ReactNode => {
    const typedOption = option as TermRef;
    return (
      <li {...props}>
        <TermMainSearchSuggestionItem
          to={
            typedOption.id ? termDetailsOverviewPath(typedOption.id) : '#'
          }
        >
          <Typography variant="body1" sx={{ mr: 1 }}>
            {typedOption.name}
          </Typography>
        </TermMainSearchSuggestionItem>
      </li>
    );
  };

  return (
    <TermMainSearchContainer>
      <TermMainSearchSearch>
        <TermMainSearchAutocomplete
          fullWidth
          value={{ name: searchText }}
          id="term-search"
          open={autocompleteOpen}
          onOpen={() => {
            if (searchText) setAutocompleteOpen(true);
          }}
          onClose={() => {
            setAutocompleteOpen(false);
          }}
          onInputChange={handleInputChange}
          getOptionLabel={getOptionLabel}
          options={options}
          loading={loadingSuggestions}
          freeSolo
          filterOptions={option => option}
          clearIcon={<ClearIcon />}
          renderInput={params => (
            <AppTextField
              {...params}
              ref={params.InputProps.ref}
              size="large"
              placeholder="Search"
              onKeyDown={handleKeyDown}
              customStartAdornment={{
                variant: 'search',
                showAdornment: true,
                onCLick: createSearch,
                icon: <SearchIcon />,
              }}
              customEndAdornment={{
                variant: 'loader',
                showAdornment: loadingSuggestions,
                position: { mr: 4 },
              }}
            />
          )}
          renderOption={renderOption}
        />
      </TermMainSearchSearch>
    </TermMainSearchContainer>
  );
};

export default TermMainSearch;
