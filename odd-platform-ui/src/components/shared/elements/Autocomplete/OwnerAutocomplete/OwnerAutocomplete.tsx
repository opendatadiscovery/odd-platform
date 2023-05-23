import React, { type HTMLAttributes } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import {
  Autocomplete,
  type AutocompleteRenderInputParams,
  Typography,
} from '@mui/material';
import type { ControllerRenderProps } from 'react-hook-form';
import type { Owner, OwnershipFormData } from 'generated-sources';
import {
  type AutocompleteInputChangeReason,
  createFilterOptions,
  type FilterOptionsState,
} from '@mui/material/useAutocomplete';
import { ClearIcon } from 'components/shared/icons';
import { useAppDispatch } from 'redux/lib/hooks';
import { fetchOwnersList } from 'redux/thunks';
import AutocompleteSuggestion from 'components/shared/elements/AutocompleteSuggestion/AutocompleteSuggestion';
import Input from 'components/shared/elements/Input/Input';

interface OwnerAutocompleteProps {
  disableOwnerCreating?: boolean;
  field: ControllerRenderProps<OwnershipFormData, 'ownerName'>;
}

const OwnerAutocomplete: React.FC<OwnerAutocompleteProps> = ({
  field,
  disableOwnerCreating = false,
}) => {
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
    <Input
      variant='main-m'
      inputContainerRef={params.InputProps.ref}
      inputProps={params.inputProps}
      label='Owner name'
      placeholder='Search name'
      isLoading={ownersLoading}
    />
  );

  const renderOption = (
    props: HTMLAttributes<HTMLLIElement>,
    option: OwnerFilterOption
  ) =>
    option.id ? (
      <li {...props}>
        <Typography variant='body2'>{option.name}</Typography>
      </li>
    ) : (
      // eslint-disable-next-line jsx-a11y/role-supports-aria-props
      <li {...props} aria-disabled={disableOwnerCreating}>
        <Typography variant='body2'>
          <AutocompleteSuggestion optionLabel='owner' optionName={option.name} />
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
