import React, { type HTMLAttributes } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { Autocomplete, Typography } from '@mui/material';
import type {
  AutocompleteRenderOptionState,
  AutocompleteRenderInputParams,
} from '@mui/material';
import type { ControllerRenderProps } from 'react-hook-form';
import {
  type AutocompleteInputChangeReason,
  createFilterOptions,
  type FilterOptionsState,
} from '@mui/material/useAutocomplete';
import { useTranslation } from 'react-i18next';
import type { Owner, UserOwnerMappingFormData } from 'generated-sources';
import { ClearIcon } from 'components/shared/icons';
import { useAppDispatch } from 'redux/lib/hooks';
import { fetchOwnersList } from 'redux/thunks';
import AutocompleteSuggestion from 'components/shared/elements/AutocompleteSuggestion/AutocompleteSuggestion';
import Input from 'components/shared/elements/Input/Input';
import { NoResultText } from 'components/shared/elements/AutocompleteSuggestion/AutocompleteSuggestionStyles';
import { useGetOwnerList } from 'lib/hooks';

interface OwnerIdAutocompleteProps {
  field: ControllerRenderProps<UserOwnerMappingFormData, 'ownerId'>;
}

const OwnerIdAutocomplete: React.FC<OwnerIdAutocompleteProps> = ({ field }) => {
  const { t } = useTranslation();

  // const dispatch = useAppDispatch();
  // const searchOwners = fetchOwnersList;

  type OwnerFilterOption = Omit<Owner, 'id' | 'name'> & Partial<Owner>;
  // const [ownerOptions, setOwnerOptions] = React.useState<OwnerFilterOption[]>([]);
  const [autocompleteOpen, setAutocompleteOpen] = React.useState(false);
  // const [ownersLoading, setOwnersLoading] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const { data: ownerOptionsRaw, isLoading: ownersLoading } = useGetOwnerList({
    page: 1,
    size: 30,
    query,
  });
  const ownerOptions: OwnerFilterOption[] = ownerOptionsRaw?.items || [];
  const ownersFilter = createFilterOptions<OwnerFilterOption>();

  // const handleOwnersSearch = React.useCallback(
  //   useDebouncedCallback(() => {
  //     setOwnersLoading(true);
  //     dispatch(searchOwners({ page: 1, size: 30, query }))
  //       .unwrap()
  //       .then(({ items }) => {
  //         setOwnersLoading(false);
  //         setOwnerOptions(items);
  //       });
  //   }, 500),
  //   [searchOwners, setOwnersLoading, setOwnerOptions, query]
  // );

  console.log('ownerOptions', ownerOptions);

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

  // React.useEffect(() => {
  //   setOwnersLoading(autocompleteOpen);
  //   if (autocompleteOpen) handleOwnersSearch();
  // }, [autocompleteOpen, handleOwnersSearch]);

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
      label={t('Owner name')}
      placeholder={t('Search name')}
      isLoading={ownersLoading}
    />
  );

  const renderOption = (
    props: HTMLAttributes<HTMLLIElement>,
    option: OwnerFilterOption,
    state: AutocompleteRenderOptionState
  ) => {
    console.log('state', state);
    return option.id ? (
      <li {...props}>
        <Typography variant='body2'>
          {option.name} {option.id}
        </Typography>
      </li>
    ) : (
      // eslint-disable-next-line jsx-a11y/role-supports-aria-props
      <li {...props}>
        <Typography variant='body2' component='span'>
          <NoResultText aria-disabled>No results</NoResultText>
        </Typography>
      </li>
    );
  };

  return (
    <Autocomplete
      // FIXME
      // {...field}
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

export default OwnerIdAutocomplete;
