import React from 'react';
import {
  Autocomplete,
  AutocompleteRenderInputParams,
  Box,
  Grid,
  Typography,
} from '@mui/material';
import {
  DataEntityGroupFormData,
  DataEntityRef,
  SearchApiGetSearchSuggestionsRequest,
} from 'generated-sources';
import { EntityClassItem, AppInput, AppButton, AppInputProps } from 'components/shared';
import { useDebouncedCallback } from 'use-debounce';
import { ClearIcon, SearchIcon } from 'components/shared/Icons';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { fetchSearchSuggestions } from 'redux/thunks';
import {
  getSearchSuggestions,
  getSearchSuggestionsFetchingStatuses,
} from 'redux/selectors';
import { UseFieldArrayAppend } from 'react-hook-form/dist/types/fieldArray';
import { Link } from 'react-router-dom';
import { useAppPaths } from 'lib/hooks';
import { updateSearchQuery } from 'redux/slices/dataEntitySearch.slice';

interface SearchSuggestionsAutocompleteProps {
  addEntities?: boolean;
  append?: UseFieldArrayAppend<DataEntityGroupFormData, 'entities'>;
  searchParams?: SearchApiGetSearchSuggestionsRequest;
  formOnChange?: (val: unknown) => void;
  inputParams?: Pick<AppInputProps, 'placeholder' | 'size' | 'label'> & {
    showSearchAdornment?: boolean;
    searchAdornmentHandler?: (query: string) => void;
    onKeyDownHandler?: (e: React.KeyboardEvent) => (query: string) => void;
  };
  linkedOption?: boolean;
  disableSuggestions?: boolean;
  searchQuery?: string;
}

const SearchSuggestionsAutocomplete: React.FC<SearchSuggestionsAutocompleteProps> = ({
  addEntities,
  append,
  searchParams,
  formOnChange,
  inputParams,
  linkedOption,
  disableSuggestions,
  searchQuery,
}) => {
  const dispatch = useAppDispatch();
  const { dataEntityDetailsPath } = useAppPaths();

  const searchSuggestions = useAppSelector(getSearchSuggestions);
  const { isLoading: isSuggestionsLoading } = useAppSelector(
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
    dispatch(updateSearchQuery(inputVal));
    if (reason === 'clear') setSelectedOption(null);
  };

  const getSuggestions = useDebouncedCallback(() => {
    dispatch(fetchSearchSuggestions({ query: searchText, ...searchParams }));
  }, 500);

  React.useEffect(() => setSearchText(searchQuery || ''), [searchQuery]);
  React.useEffect(() => setOptions(searchSuggestions), [searchSuggestions]);

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

    const item = (
      <Box display='flex'>
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
      </Box>
    );

    const linkedItem = id ? <Link to={dataEntityDetailsPath(id)}>{item}</Link> : null;

    return (
      <li {...props} key={id}>
        {linkedOption ? linkedItem : item}
      </li>
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!inputParams?.onKeyDownHandler) return;
    inputParams.onKeyDownHandler(e)(searchText);
  };

  const handleSearchIconClick = () => {
    if (!inputParams?.searchAdornmentHandler) return;
    inputParams.searchAdornmentHandler(searchText);
  };

  const customStartAdornment: AppInputProps['customStartAdornment'] =
    inputParams?.showSearchAdornment
      ? {
          variant: 'search',
          showAdornment: true,
          onCLick: handleSearchIconClick,
          icon: <SearchIcon />,
        }
      : undefined;

  const customEndAdornment: AppInputProps['customEndAdornment'] = {
    variant: 'loader',
    showAdornment: isSuggestionsLoading,
    position: { mr: 4 },
  };

  const renderInput = (params: AutocompleteRenderInputParams): React.ReactNode => (
    <Grid container flexWrap='nowrap' alignItems='center'>
      <AppInput
        {...params}
        placeholder={inputParams?.placeholder}
        size={inputParams?.size}
        label={inputParams?.label}
        ref={params.InputProps.ref}
        onKeyDown={handleKeyDown}
        customStartAdornment={customStartAdornment}
        customEndAdornment={customEndAdornment}
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

  const handleOpen = () =>
    searchText && !disableSuggestions ? setAutocompleteOpen(true) : null;
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
      loading={isSuggestionsLoading}
      freeSolo
      filterOptions={option => option}
      clearIcon={<ClearIcon />}
      renderInput={renderInput}
      renderOption={renderOption}
    />
  );
};

export default SearchSuggestionsAutocomplete;
