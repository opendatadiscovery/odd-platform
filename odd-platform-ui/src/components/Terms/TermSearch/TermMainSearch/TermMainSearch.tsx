import React from 'react';
import { Typography } from '@mui/material';
import { useHistory } from 'react-router-dom';
import { TermRef } from 'generated-sources';
import { useDebouncedCallback } from 'use-debounce';
import { AppInput } from 'components/shared';
import { ClearIcon, SearchIcon } from 'components/shared/Icons';
import { useAppPaths } from 'lib/hooks';
import { useAppDispatch, useAppSelector } from 'lib/redux/hooks';
import {
  getTermSearchQuery,
  getTermSearchSuggestions,
  getTermSearchSuggestionsFetchStatuses,
} from 'redux/selectors';
import {
  createTermSearch,
  fetchTermSearchSuggestions,
} from 'redux/thunks';
import * as S from './TermMainSearchStyles';

const TermMainSearch: React.FC = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const { termSearchPath, termDetailsOverviewPath } = useAppPaths();

  const query = useAppSelector(getTermSearchQuery);
  const suggestions = useAppSelector(getTermSearchSuggestions);
  const { isLoading: isSuggestionsFetching } = useAppSelector(
    getTermSearchSuggestionsFetchStatuses
  );

  const [searchText, setSearchText] = React.useState<string>('');
  const [options, setOptions] = React.useState<Partial<TermRef>[]>([]);
  const [autocompleteOpen, setAutocompleteOpen] =
    React.useState<boolean>(false);

  const createSearch = () => {
    const termSearchQuery = {
      query: searchText,
      pageSize: 30,
      filters: {},
    };
    dispatch(createTermSearch({ termSearchFormData: termSearchQuery }))
      .unwrap()
      .then(termSearch => {
        const termSearchLink = termSearchPath(termSearch.searchId);
        history.replace(termSearchLink);
      });
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
      dispatch(fetchTermSearchSuggestions({ query: searchText }));
    }, 500),
    [searchText, setOptions, fetchTermSearchSuggestions]
  );

  React.useEffect(() => {
    setSearchText(query || '');
  }, [query]);

  React.useEffect(() => {
    setOptions(suggestions);
  }, [suggestions]);

  React.useEffect(() => {
    if (!searchText) return;
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
        <S.TermMainSearchSuggestionItem
          to={
            typedOption.id ? termDetailsOverviewPath(typedOption.id) : '#'
          }
        >
          <Typography variant="body1" sx={{ mr: 1 }}>
            {typedOption.name}
          </Typography>
        </S.TermMainSearchSuggestionItem>
      </li>
    );
  };

  return (
    <S.TermMainSearchContainer>
      <S.TermMainSearchSearch>
        <S.TermMainSearchAutocomplete
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
          loading={isSuggestionsFetching}
          freeSolo
          filterOptions={option => option}
          clearIcon={<ClearIcon />}
          renderInput={params => (
            <AppInput
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
                showAdornment: isSuggestionsFetching,
                position: { mr: 4 },
              }}
            />
          )}
          renderOption={renderOption}
        />
      </S.TermMainSearchSearch>
    </S.TermMainSearchContainer>
  );
};

export default TermMainSearch;
