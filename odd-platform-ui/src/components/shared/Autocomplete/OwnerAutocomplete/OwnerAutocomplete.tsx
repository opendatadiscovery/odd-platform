import React, { HTMLAttributes } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { Autocomplete, AutocompleteRenderInputParams, Typography } from '@mui/material';
import { ControllerRenderProps } from 'react-hook-form';
import { Owner, OwnershipFormData } from 'generated-sources';
import {
  AutocompleteInputChangeReason,
  createFilterOptions,
  FilterOptionsState,
} from '@mui/material/useAutocomplete';
import { AutocompleteSuggestion, AppInput } from 'components/shared';
import { ClearIcon } from 'components/shared/Icons';
import { useAppDispatch } from 'redux/lib/hooks';
import { fetchOwnersList } from 'redux/thunks';

interface OwnerAutocompleteProps {
  field: ControllerRenderProps<OwnershipFormData, 'ownerName'>;
}

const OwnerAutocomplete: React.FC<OwnerAutocompleteProps> = ({ field }) => {
  const dispatch = useAppDispatch();
  const searchOwners = fetchOwnersList;

  type OwnerFilterOption = Omit<Owner, 'id' | 'name'> & Partial<Owner>;
  const [ownerOptions, setOwnerOptions] = React.useState<OwnerFilterOption[]>([]);
  const [autocompleteOpen, setAutocompleteOpen] = React.useState(false);
  const [ownersLoading, setOwnersLoading] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const ownersFilter = createFilterOptions<OwnerFilterOption>();

  const handleOwnersSearch = React.useCallback(
    useDebouncedCallback(() => {
      setOwnersLoading(true);
      dispatch(searchOwners({ page: 1, size: 30, query }))
        .unwrap()
        .then(({ items }) => {
          setOwnersLoading(false);
          setOwnerOptions(items);
        });
    }, 500),
    [searchOwners, setOwnersLoading, setOwnerOptions, query]
  );

  const onOwnersSearchInputChange = React.useCallback(
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

  const getOwnerFilterOptions = (
    filterOptions: OwnerFilterOption[],
    params: FilterOptionsState<OwnerFilterOption>
  ) => {
    const filtered = ownersFilter(filterOptions, params);
    if (
      query !== '' &&
      !ownersLoading &&
      !filterOptions.some(option => option.name === query)
    ) {
      return [...filtered, { name: query }];
    }
    return filtered;
  };

  React.useEffect(() => {
    setOwnersLoading(autocompleteOpen);
    if (autocompleteOpen) handleOwnersSearch();
  }, [autocompleteOpen, handleOwnersSearch]);

  const getOptionLabel = React.useCallback((option: OwnerFilterOption | string) => {
    if (typeof option === 'string') return option;
    if ('name' in option && option.name) return option.name;
    return '';
  }, []);

  const onAutocompleteChange = (
    _: React.SyntheticEvent,
    value: null | string | OwnerFilterOption
  ): void => {
    if (!value || typeof value === 'string') field.onChange(value);
    else field.onChange(value.name);
  };

  const handleOpen = () => setAutocompleteOpen(true);
  const handleClose = () => setAutocompleteOpen(false);

  const isOptionEqualToValue = (option: OwnerFilterOption, value: OwnerFilterOption) =>
    option.name === value.name;

  const renderInput = (params: AutocompleteRenderInputParams) => (
    <AppInput
      {...params}
      ref={params.InputProps.ref}
      label='Owner name'
      placeholder='Search name'
      customEndAdornment={{
        variant: 'loader',
        showAdornment: ownersLoading,
        position: { mr: 4 },
      }}
    />
  );

  const renderOption = (
    props: HTMLAttributes<HTMLLIElement>,
    option: OwnerFilterOption
  ) => (
    <li {...props}>
      <Typography variant='body2'>
        {option.id ? (
          option.name
        ) : (
          <AutocompleteSuggestion optionLabel='owner' optionName={option.name} />
        )}
      </Typography>
    </li>
  );

  return (
    <Autocomplete
      {...field}
      fullWidth
      // id='owners-name-search'
      open={autocompleteOpen}
      onOpen={handleOpen}
      onClose={handleClose}
      onChange={onAutocompleteChange}
      onInputChange={onOwnersSearchInputChange}
      getOptionLabel={getOptionLabel}
      options={ownerOptions}
      filterOptions={getOwnerFilterOptions}
      loading={ownersLoading}
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

export default OwnerAutocomplete;
