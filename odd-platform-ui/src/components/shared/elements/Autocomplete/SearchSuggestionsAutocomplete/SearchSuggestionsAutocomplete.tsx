import React, { type FC, useEffect, useState } from 'react';
import {
  Autocomplete,
  type AutocompleteRenderInputParams,
  Box,
  Grid,
  Typography,
} from '@mui/material';
import { useDebouncedCallback } from 'use-debounce';
import { type UseFieldArrayAppend } from 'react-hook-form/dist/types/fieldArray';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type {
  DataEntityGroupFormData,
  DataEntityRef,
  SearchApiGetSearchSuggestionsRequest,
} from 'generated-sources';
import { ClearIcon } from 'components/shared/icons';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { fetchSearchSuggestions } from 'redux/thunks';
import {
  getSearchSuggestions,
  getSearchSuggestionsFetchingStatuses,
} from 'redux/selectors';
import EntityClassItem from 'components/shared/elements/EntityClassItem/EntityClassItem';
import Button from 'components/shared/elements/Button/Button';
import Input, { type InputProps } from 'components/shared/elements/Input/Input';
import { useIsEmbeddedPath } from 'lib/hooks/useAppPaths/useIsEmbeddedPath';
import { dataEntityDetailsPath } from '../../../../../routes';

interface SearchSuggestionsAutocompleteProps {
  addEntities?: boolean;
  append?: UseFieldArrayAppend<DataEntityGroupFormData, 'entities'>;
  searchParams?: SearchApiGetSearchSuggestionsRequest;
  formOnChange?: (val: unknown) => void;
  inputParams?: Pick<InputProps, 'placeholder' | 'variant' | 'label'> & {
    searchAdornmentHandler?: (query: string) => void;
    onKeyDownHandler?: (e: React.KeyboardEvent) => (query: string) => void;
  };
  linkedOption?: boolean;
  disableSuggestions?: boolean;
  searchQuery?: string;
}

const SearchSuggestionsAutocomplete: FC<SearchSuggestionsAutocompleteProps> = ({
  addEntities,
  append,
  searchParams,
  formOnChange,
  inputParams,
  linkedOption,
  disableSuggestions,
  searchQuery,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { updatePath } = useIsEmbeddedPath();

  const searchSuggestions = useAppSelector(getSearchSuggestions);
  const { isLoading: isSuggestionsLoading } = useAppSelector(
    getSearchSuggestionsFetchingStatuses
  );

  const [searchText, setSearchText] = useState('');
  const [options, setOptions] = useState<Partial<DataEntityRef>[]>([]);
  const [selectedOption, setSelectedOption] = useState<DataEntityRef | null>(null);
  const [autocompleteOpen, setAutocompleteOpen] = useState(false);

  const handleInputChange = (
    _: React.ChangeEvent<unknown>,
    inputVal: string,
    reason: string
  ) => {
    setSearchText(inputVal);
    if (reason === 'clear') setSelectedOption(null);
  };

  const getSuggestions = useDebouncedCallback(() => {
    dispatch(fetchSearchSuggestions({ query: searchText, ...searchParams }));
  }, 500);

  useEffect(() => setSearchText(searchQuery || ''), [searchQuery]);
  useEffect(() => setOptions(searchSuggestions), [searchSuggestions]);

  useEffect(() => {
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

    const linkedItem = id ? (
      <Link to={updatePath(dataEntityDetailsPath(id))}>{item}</Link>
    ) : null;

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

  const handleSearchClick = () => {
    if (!inputParams?.searchAdornmentHandler) return;
    inputParams.searchAdornmentHandler(searchText);
  };

  const renderInput = (params: AutocompleteRenderInputParams): React.ReactNode => (
    <Grid container flexWrap='nowrap' alignItems='center'>
      <Input
        data-qa='search_string'
        variant={inputParams?.variant}
        inputContainerRef={params.InputProps.ref}
        inputProps={params.inputProps}
        label={inputParams?.label}
        placeholder={inputParams?.placeholder}
        isLoading={isSuggestionsLoading}
        onKeyDown={handleKeyDown}
        handleSearchClick={handleSearchClick}
      />
      {addEntities && (
        <Button
          text={t('Add')}
          sx={{ mt: 2, ml: 0.5, flexShrink: 0 }}
          buttonType='secondary-lg'
          onClick={handleAddEntity}
          disabled={selectedOption === null}
        />
      )}
    </Grid>
  );

  const handleOpen = () =>
    searchText && !disableSuggestions ? setAutocompleteOpen(true) : null;
  const handleClose = () => setAutocompleteOpen(false);

  const listboxComponent = React.useCallback(
    (props: React.HTMLAttributes<HTMLElement>) =>
      React.createElement('ul', { ...props, 'data-qa': 'search_dropdown' }),
    []
  );

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
      ListboxComponent={listboxComponent}
    />
  );
};

export default SearchSuggestionsAutocomplete;
