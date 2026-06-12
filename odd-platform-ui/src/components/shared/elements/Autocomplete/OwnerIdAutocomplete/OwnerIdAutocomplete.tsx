import React, { type HTMLAttributes } from 'react';
import { Autocomplete, Typography } from '@mui/material';
import type { AutocompleteRenderInputParams } from '@mui/material';
import type { ControllerRenderProps } from 'react-hook-form';
import {
  type AutocompleteInputChangeReason,
  createFilterOptions,
  type FilterOptionsState,
} from '@mui/material/useAutocomplete';
import { useTranslation } from 'react-i18next';
import type { Owner, UserOwnerMappingFormData } from 'generated-sources';
import { ClearIcon } from 'components/shared/icons';
import Input from 'components/shared/elements/Input/Input';
import { useGetOwnerList } from 'lib/hooks';

interface OwnerIdAutocompleteProps {
  field: ControllerRenderProps<UserOwnerMappingFormData, 'ownerId'>;
}

const OwnerIdAutocomplete: React.FC<OwnerIdAutocompleteProps> = ({ field }) => {
  const { t } = useTranslation();

  type OwnerFilterOption = Omit<Owner, 'id' | 'name'> & Partial<Owner>;
  const [autocompleteOpen, setAutocompleteOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const { data: ownerOptionsRaw, isLoading: ownersLoading } = useGetOwnerList({
    page: 1,
    size: 30,
    query,
  });
  const ownerOptions: OwnerFilterOption[] = ownerOptionsRaw?.items || [];
  const ownersFilter = createFilterOptions<OwnerFilterOption>();

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
      return [...filtered];
    }
    return filtered;
  };

  const getOptionLabel = React.useCallback((option: OwnerFilterOption | string) => {
    if (typeof option === 'string') return option;
    if (option.name) return option.name;
    return '';
  }, []);

  const onAutocompleteChange = (
    _: React.SyntheticEvent,
    value: null | string | OwnerFilterOption
  ): void => {
    if (!value || typeof value === 'string') field.onChange(value);
    else field.onChange(value.id);
  };

  const handleOpen = () => setAutocompleteOpen(true);
  const handleClose = () => setAutocompleteOpen(false);

  const isOptionEqualToValue = (option: OwnerFilterOption, value: OwnerFilterOption) =>
    option.id === value.id;

  const renderInput = (params: AutocompleteRenderInputParams) => (
    <Input
      variant='main-m'
      inputContainerRef={params.InputProps.ref}
      inputProps={params.inputProps}
      label={t('Owner name')}
      placeholder={t('Search name')}
      isLoading={ownersLoading}
    />
  );

  const renderOption = (
    props: HTMLAttributes<HTMLLIElement>,
    option: OwnerFilterOption
  ) => (
    <li {...props}>
      <Typography variant='body2'>{option.name}</Typography>
    </li>
  );
  return (
    <Autocomplete
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
      clearOnBlur
      clearIcon={<ClearIcon />}
      renderInput={renderInput}
      renderOption={renderOption}
      noOptionsText='No results'
    />
  );
};

export default OwnerIdAutocomplete;
