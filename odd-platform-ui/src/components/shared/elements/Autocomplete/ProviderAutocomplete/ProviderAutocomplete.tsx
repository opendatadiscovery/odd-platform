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
import type { UserOwnerMappingFormData } from 'generated-sources';
import { ClearIcon } from 'components/shared/icons';
import Input from 'components/shared/elements/Input/Input';
import { useGetProviderList } from 'lib/hooks';

interface ProviderAutocompleteProps {
  field: ControllerRenderProps<UserOwnerMappingFormData, 'provider'>;
}

const ProviderAutocomplete: React.FC<ProviderAutocompleteProps> = ({ field }) => {
  const { t } = useTranslation();

  const [autocompleteOpen, setAutocompleteOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const { data: providerOptionsRaw, isLoading: providersLoading } = useGetProviderList();
  const providerOptions: string[] = providerOptionsRaw?.activeProviders || [];
  const providersFilter = createFilterOptions<string>();

  const onProvidersSearchInputChange = React.useCallback(
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

  const getProviderFilterOptions = (
    filterOptions: string[],
    params: FilterOptionsState<string>
  ) => {
    const filtered = providersFilter(filterOptions, params);
    if (
      query !== '' &&
      !providersLoading &&
      !filterOptions.some(option => option === query)
    ) {
      return [...filtered];
    }
    return filtered;
  };

  const getOptionLabel = React.useCallback((option: string) => {
    if (typeof option === 'string') return option;
    return '';
  }, []);

  const onAutocompleteChange = (_: React.SyntheticEvent, value: null | string): void => {
    if (!value || typeof value === 'string') field.onChange(value);
    else field.onChange(value);
  };

  const handleOpen = () => setAutocompleteOpen(true);
  const handleClose = () => setAutocompleteOpen(false);

  const renderInput = (params: AutocompleteRenderInputParams) => (
    <Input
      variant='main-m'
      inputContainerRef={params.InputProps.ref}
      inputProps={params.inputProps}
      label='Provider name'
      placeholder={t('Search name')}
      isLoading={providersLoading}
    />
  );

  const renderOption = (props: HTMLAttributes<HTMLLIElement>, option: string) => (
    <li {...props}>
      <Typography variant='body2'>{option}</Typography>
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
      onInputChange={onProvidersSearchInputChange}
      getOptionLabel={getOptionLabel}
      options={providerOptions}
      filterOptions={getProviderFilterOptions}
      loading={providersLoading}
      handleHomeEndKeys
      selectOnFocus
      blurOnSelect
      clearOnBlur
      clearIcon={<ClearIcon />}
      renderInput={renderInput}
      renderOption={renderOption}
      noOptionsText='No active providers'
    />
  );
};

export default ProviderAutocomplete;
