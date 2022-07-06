import React from 'react';
import { Autocomplete, Grid, Typography } from '@mui/material';
import {
  DataEntityRef,
  SearchApiGetSearchSuggestionsRequest,
} from 'generated-sources';
import EntityClassItem from 'components/shared/EntityClassItem/EntityClassItem';
import { useDebouncedCallback } from 'use-debounce';
import AppInput from 'components/shared/AppInput/AppInput';
import ClearIcon from 'components/shared/Icons/ClearIcon';
import AppButton from 'components/shared/AppButton/AppButton';
import { useAppDispatch, useAppSelector } from 'lib/redux/hooks';
import { fetchSearchSuggestions } from 'redux/thunks';
import {
  getSearchSuggestions,
  getSearchSuggestionsFetchingStatuses,
} from 'redux/selectors';
import { UseFieldArrayReturn } from 'react-hook-form';

interface SearchSuggestionsAutocompleteProps {
  placeholder: string;
  label?: string;
  addEntities?: boolean;
  append?: UseFieldArrayReturn['append'];
  searchParams?: SearchApiGetSearchSuggestionsRequest;
  formOnChange: (val: any) => void;
}

const SearchSuggestionsAutocomplete: React.FC<
  SearchSuggestionsAutocompleteProps
> = ({
  placeholder,
  label,
  addEntities,
  append,
  searchParams,
  formOnChange,
}) => {
  const dispatch = useAppDispatch();

  const searchSuggestions = useAppSelector(getSearchSuggestions);
  const { isLoading: isSearchSuggestionsLoading } = useAppSelector(
    getSearchSuggestionsFetchingStatuses
  );

  const [searchText, setSearchText] = React.useState<string>('');
  const [options, setOptions] = React.useState<Partial<DataEntityRef>[]>(
    []
  );
  const [selectedOption, setSelectedOption] =
    React.useState<DataEntityRef | null>(null);
  const [autocompleteOpen, setAutocompleteOpen] =
    React.useState<boolean>(false);

  const handleInputChange = (
    _: React.ChangeEvent<unknown>,
    inputVal: string,
    reason: string
  ) => {
    setSearchText(inputVal);
    if (inputVal) {
      setAutocompleteOpen(true);
    }
    if (reason === 'clear') {
      setSelectedOption(null);
    }
  };

  const getSuggestions = React.useCallback(
    useDebouncedCallback(() => {
      dispatch(
        fetchSearchSuggestions({ query: searchText, ...searchParams })
      );
    }, 500),
    [searchText, fetchSearchSuggestions, searchParams]
  );

  React.useEffect(() => {
    setOptions(searchSuggestions);
  }, [searchSuggestions]);

  React.useEffect(() => {
    if (!searchText) return;
    if (autocompleteOpen) {
      getSuggestions();
    }
  }, [autocompleteOpen, searchText, getSuggestions]);

  const getOptionLabel = (option: unknown) => {
    const typedOption = option as DataEntityRef;
    return typedOption.internalName || typedOption.externalName || '';
  };

  const handleOptionChange = React.useCallback(
    (
      _: React.ChangeEvent<unknown>,
      value: Partial<DataEntityRef> | string | null
    ) => {
      setSelectedOption(value as DataEntityRef);
      formOnChange(value);
    },
    []
  );
  const handleAddEntity = () => {
    if (append) {
      append(selectedOption as DataEntityRef);
    }
    setSearchText('');
    setSelectedOption(null);
  };

  const renderOption = (
    props: React.HTMLAttributes<HTMLLIElement>,
    option: unknown
  ): React.ReactNode => {
    const typedOption = option as DataEntityRef;
    return (
      <li {...props} key={typedOption.id}>
        <Typography
          variant="body1"
          sx={{ mr: 1 }}
          noWrap
          title={typedOption.internalName || typedOption.externalName}
        >
          {typedOption.internalName || typedOption.externalName}
        </Typography>
        {typedOption.entityClasses?.map(entityClass => (
          <EntityClassItem
            sx={{ mr: 0.5 }}
            key={entityClass.id}
            entityClassName={entityClass.name}
          />
        ))}
      </li>
    );
  };

  return (
    <Autocomplete
      fullWidth
      value={{ externalName: searchText }}
      open={autocompleteOpen}
      onOpen={() => {
        if (searchText) setAutocompleteOpen(true);
      }}
      onClose={() => {
        setAutocompleteOpen(false);
      }}
      onInputChange={handleInputChange}
      onChange={handleOptionChange}
      getOptionLabel={getOptionLabel}
      options={options}
      loading={isSearchSuggestionsLoading}
      freeSolo
      filterOptions={option => option}
      clearIcon={<ClearIcon />}
      sx={{ mt: 1.5 }}
      renderInput={params => (
        <Grid container flexWrap="nowrap" alignItems="center">
          <AppInput
            {...params}
            ref={params.InputProps.ref}
            label="Entities"
            customEndAdornment={{
              variant: 'loader',
              showAdornment: isSearchSuggestionsLoading,
              position: { mr: 4 },
            }}
          />
          {addEntities && (
            <AppButton
              sx={{ mt: 2, ml: 0.5 }}
              size="large"
              color="primaryLight"
              onClick={handleAddEntity}
              disabled={selectedOption === null}
            >
              Add
            </AppButton>
          )}
        </Grid>
      )}
      renderOption={renderOption}
    />
  );
};

export default SearchSuggestionsAutocomplete;
