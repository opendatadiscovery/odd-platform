import React, { type HTMLAttributes } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import {
  Autocomplete,
  type AutocompleteRenderInputParams,
  Typography,
} from '@mui/material';
import { type ControllerRenderProps } from 'react-hook-form';
import type { OwnershipFormData, Title } from 'generated-sources';
import {
  type AutocompleteInputChangeReason,
  createFilterOptions,
  type FilterOptionsState,
} from '@mui/material/useAutocomplete';
import { ClearIcon } from 'components/shared/icons';
import { useAppDispatch } from 'redux/lib/hooks';
import { fetchOwnershipTitleList } from 'redux/thunks';
import AutocompleteSuggestion from 'components/shared/elements/AutocompleteSuggestion/AutocompleteSuggestion';
import Input from 'components/shared/elements/Input/Input';

interface OwnershipTitleAutocompleteProps {
  field: ControllerRenderProps<OwnershipFormData, 'titleName'>;
}

const OwnershipTitleAutocomplete: React.FC<OwnershipTitleAutocompleteProps> = ({
  field,
}) => {
  const dispatch = useAppDispatch();
  const searchTitles = fetchOwnershipTitleList;

  type TitleFilterOption = Omit<Title, 'id' | 'name'> & Partial<Title>;
  const [titlesOptions, setTitlesOptions] = React.useState<TitleFilterOption[]>([]);
  const [autocompleteOpen, setAutocompleteOpen] = React.useState(false);
  const [titlesLoading, setTitlesLoading] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const titlesFilter = createFilterOptions<TitleFilterOption>();

  const handleTitlesSearch = React.useCallback(
    useDebouncedCallback(() => {
      setTitlesLoading(true);
      dispatch(searchTitles({ page: 1, size: 30, query }))
        .unwrap()
        .then(({ titleList }) => {
          setTitlesLoading(false);
          setTitlesOptions(titleList);
        });
    }, 500),
    [searchTitles, setTitlesLoading, setTitlesOptions]
  );

  const onTitlesSearchInputChange = React.useCallback(
    (
      _: React.ChangeEvent<unknown>,
      inputQuery: string,
      reason: AutocompleteInputChangeReason
    ) => {
      if (reason === 'input') setQuery(inputQuery);
      else setQuery('');
    },
    [setQuery]
  );

  React.useEffect(() => {
    setTitlesLoading(autocompleteOpen);
    if (autocompleteOpen) handleTitlesSearch();
  }, [autocompleteOpen, handleTitlesSearch]);

  const getOptionLabel = React.useCallback((option: TitleFilterOption | string) => {
    if (typeof option === 'string') return option;
    if ('name' in option && option.name) return option.name;
    return '';
  }, []);

  const getTitleFilterOptions = (
    filterOptions: TitleFilterOption[],
    params: FilterOptionsState<TitleFilterOption>
  ) => {
    const filtered = titlesFilter(filterOptions, params);
    if (
      query !== '' &&
      !titlesLoading &&
      !filterOptions.some(option => option.name === query)
    ) {
      return [...filtered, { name: query }];
    }
    return filtered;
  };

  const onAutocompleteChange = (
    _: React.SyntheticEvent,
    data: string | null | TitleFilterOption
  ): void => {
    if (!data || typeof data === 'string') field.onChange(data);
    else field.onChange(data.name);
  };

  const handleOpen = () => setAutocompleteOpen(true);
  const handleClose = () => setAutocompleteOpen(false);

  const isOptionEqualToValue = (option: TitleFilterOption, value: TitleFilterOption) =>
    option.name === value.name;

  const renderInput = (params: AutocompleteRenderInputParams) => (
    <Input
      sx={{ mt: 1.5 }}
      variant='main-m'
      inputContainerRef={params.InputProps.ref}
      inputProps={params.inputProps}
      label='Title'
      placeholder='Search title…'
      isLoading={titlesLoading}
    />
  );

  const renderOption = (
    props: HTMLAttributes<HTMLLIElement>,
    option: TitleFilterOption
  ) => (
    <li {...props}>
      <Typography variant='body2'>
        {option.id ? (
          option.name
        ) : (
          <AutocompleteSuggestion optionLabel='title' optionName={option.name} />
        )}
      </Typography>
    </li>
  );

  return (
    <Autocomplete
      {...field}
      fullWidth
      open={autocompleteOpen}
      onOpen={handleOpen}
      onClose={handleClose}
      onChange={onAutocompleteChange}
      onInputChange={onTitlesSearchInputChange}
      getOptionLabel={getOptionLabel}
      options={titlesOptions}
      filterOptions={getTitleFilterOptions}
      loading={titlesLoading}
      isOptionEqualToValue={isOptionEqualToValue}
      handleHomeEndKeys
      selectOnFocus
      blurOnSelect
      freeSolo
      clearIcon={<ClearIcon />}
      renderInput={renderInput}
      renderOption={renderOption}
    />
  );
};

export default OwnershipTitleAutocomplete;
