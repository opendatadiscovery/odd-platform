import React from 'react';
import {
  Autocomplete,
  AutocompleteRenderInputParams,
  Grid,
  Typography,
} from '@mui/material';
import {
  DataEntityGroupFormData,
  DataEntityRef,
  SearchApiGetSearchSuggestionsRequest,
} from 'generated-sources';
import { EntityClassItem, AppInput, AppButton } from 'components/shared';
import { useDebouncedCallback } from 'use-debounce';
import { ClearIcon } from 'components/shared/Icons';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { fetchSearchSuggestions } from 'redux/thunks';
import {
  getSearchSuggestions,
  getSearchSuggestionsFetchingStatuses,
} from 'redux/selectors';
import { UseFieldArrayAppend } from 'react-hook-form/dist/types/fieldArray';
import { AppInputProps } from 'components/shared/AppInput/AppInput';

interface SearchSuggestionsAutocompleteProps {
  addEntities?: boolean;
  append?: UseFieldArrayAppend<DataEntityGroupFormData, 'entities'>;
  searchParams?: SearchApiGetSearchSuggestionsRequest;
  formOnChange?: (val: unknown) => void;
  inputParams?: Pick<AppInputProps, 'placeholder' | 'size' | 'onKeyDown' | 'label'> & {
    showSearchIcon?: boolean;
  };
}

const SearchSuggestionsAutocomplete: React.FC<SearchSuggestionsAutocompleteProps> = ({
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

  const [searchText, setSearchText] = React.useState('');
  const [options, setOptions] = React.useState<Partial<DataEntityRef>[]>([]);
  const [selectedOption, setSelectedOption] = React.useState<DataEntityRef | null>(null);
  const [autocompleteOpen, setAutocompleteOpen] = React.useState(false);

  const handleInputChange = (
    _: React.ChangeEvent<unknown>,
    inputVal: string,
    reason: string
  ) => {
    setSearchText(inputVal);
    if (inputVal) setAutocompleteOpen(true);
    if (reason === 'clear') setSelectedOption(null);
  };

  const getSuggestions = useDebouncedCallback(() => {
    dispatch(fetchSearchSuggestions({ query: searchText, ...searchParams }));
  }, 500);

  React.useEffect(() => {
    setOptions(searchSuggestions);
  }, [searchSuggestions]);

  React.useEffect(() => {
    if (!searchText) {
      setAutocompleteOpen(false);
      return;
    }
    if (autocompleteOpen) getSuggestions();
  }, [autocompleteOpen, searchText, getSuggestions]);

  const getOptionLabel = (option: Partial<DataEntityRef> | string) => {
    if (typeof option === 'string') return option;
    const { internalName, externalName } = option;
    return internalName || externalName || '';
  };

  const handleOptionChange = (
    _: React.ChangeEvent<unknown>,
    value: Partial<DataEntityRef> | string | null
  ) => {
    setSelectedOption(value as DataEntityRef);
    if (formOnChange) formOnChange(value);
  };

  const handleAddEntity = () => {
    if (append && selectedOption !== null) {
      append(selectedOption);
    }
    setSearchText('');
    setSelectedOption(null);
  };

  const renderOption = (
    props: React.HTMLAttributes<HTMLLIElement>,
    option: Partial<DataEntityRef>
  ): React.ReactNode => {
    const { id, internalName, externalName, entityClasses } = option;

    return (
      <li {...props} key={id}>
        <Typography
          variant='body1'
          sx={{ mr: 1 }}
          noWrap
          title={internalName || externalName}
        >
          {internalName || externalName}
        </Typography>
        {entityClasses?.map(entityClass => (
          <EntityClassItem
            sx={{ mr: 0.5 }}
            key={entityClass.id}
            entityClassName={entityClass?.name}
          />
        ))}
      </li>
    );
  };

  const renderInput = (params: AutocompleteRenderInputParams): React.ReactNode => (
    <Grid container flexWrap='nowrap' alignItems='center'>
      <AppInput
        {...params}
        ref={params.InputProps.ref}
        label='Entities'
        customEndAdornment={{
          variant: 'loader',
          showAdornment: isSearchSuggestionsLoading,
          position: { mr: 4 },
        }}
      />
      {addEntities && (
        <AppButton
          sx={{ mt: 2, ml: 0.5 }}
          size='large'
          color='primaryLight'
          onClick={handleAddEntity}
          disabled={selectedOption === null}
        >
          Add
        </AppButton>
      )}
    </Grid>
  );

  const handleOpen = () => (searchText ? setAutocompleteOpen(true) : null);
  const handleClose = () => setAutocompleteOpen(false);

  return (
    <Autocomplete
      sx={{ mt: 1.5 }}
      fullWidth
      value={{ externalName: searchText }}
      open={autocompleteOpen}
      onOpen={handleOpen}
      onClose={handleClose}
      onInputChange={handleInputChange}
      onChange={handleOptionChange}
      getOptionLabel={getOptionLabel}
      options={options}
      loading={isSearchSuggestionsLoading}
      freeSolo
      filterOptions={option => option}
      clearIcon={<ClearIcon />}
      renderInput={renderInput}
      renderOption={renderOption}
    />
  );
};

export default SearchSuggestionsAutocomplete;
