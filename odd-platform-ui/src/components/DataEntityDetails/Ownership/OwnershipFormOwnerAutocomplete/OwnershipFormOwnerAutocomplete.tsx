import React from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { Autocomplete, Typography } from '@mui/material';
import { ControllerRenderProps } from 'react-hook-form';
import {
  Owner,
  OwnerApiGetOwnerListRequest,
  OwnerList,
  OwnershipFormData,
} from 'generated-sources';
import {
  AutocompleteInputChangeReason,
  createFilterOptions,
  FilterOptionsState,
} from '@mui/material/useAutocomplete';
import AutocompleteSuggestion from 'components/shared/AutocompleteSuggestion/AutocompleteSuggestion';
import AppTextField from 'components/shared/AppTextField/AppTextField';
import ClearIcon from 'components/shared/Icons/ClearIcon';

interface OwnershipFormOwnerAutocompleteProps {
  field: ControllerRenderProps<OwnershipFormData, 'ownerName'>;
  searchOwners: (
    params: OwnerApiGetOwnerListRequest
  ) => Promise<OwnerList>;
}

const OwnershipFormOwnerAutocomplete: React.FC<
  OwnershipFormOwnerAutocompleteProps
> = ({ field, searchOwners }) => {
  type OwnerFilterOption = Omit<Owner, 'id' | 'name'> & Partial<Owner>;
  const [ownerOptions, setOwnerOptions] = React.useState<
    OwnerFilterOption[]
  >([]);
  const [ownersAutocompleteOpen, setOwnersAutocompleteOpen] =
    React.useState(false);
  const [ownersLoading, setOwnersLoading] = React.useState<boolean>(false);
  const [ownersSearchText, setOwnersSearchText] =
    React.useState<string>('');
  const ownersFilter = createFilterOptions<OwnerFilterOption>();

  const handleOwnersSearch = React.useCallback(
    useDebouncedCallback(() => {
      setOwnersLoading(true);
      searchOwners({ page: 1, size: 30, query: ownersSearchText }).then(
        response => {
          setOwnersLoading(false);
          setOwnerOptions(response.items);
        }
      );
    }, 500),
    [searchOwners, setOwnersLoading, setOwnerOptions, ownersSearchText]
  );

  const onOwnersSearchInputChange = React.useCallback(
    (
      _: React.ChangeEvent<unknown>,
      query: string,
      reason: AutocompleteInputChangeReason
    ) => {
      if (reason === 'input') {
        setOwnersSearchText(query);
      } else {
        setOwnersSearchText(''); // Clear input on select
      }
    },
    [setOwnersSearchText]
  );

  const getOwnerFilterOptions = (
    filterOptions: OwnerFilterOption[],
    params: FilterOptionsState<OwnerFilterOption>
  ) => {
    const filtered = ownersFilter(filterOptions, params);
    if (
      ownersSearchText !== '' &&
      !ownersLoading &&
      !filterOptions.some(option => option.name === ownersSearchText)
    ) {
      return [...filtered, { name: ownersSearchText }];
    }
    return filtered;
  };

  React.useEffect(() => {
    setOwnersLoading(ownersAutocompleteOpen);
    if (ownersAutocompleteOpen) {
      handleOwnersSearch();
    }
  }, [ownersAutocompleteOpen, handleOwnersSearch]);

  const getOptionLabel = React.useCallback((option: OwnerFilterOption) => {
    if (typeof option === 'string') {
      return option;
    }
    if ('name' in option && option.name) {
      return option.name;
    }
    return '';
  }, []);

  const onAutocompleteChange = (
    _: React.SyntheticEvent,
    value: null | string | OwnerFilterOption
  ): void => {
    if (!value || typeof value === 'string') {
      field.onChange(value);
    } else {
      field.onChange(value.name);
    }
  };

  return (
    <Autocomplete
      {...field}
      fullWidth
      id="owners-name-search"
      open={ownersAutocompleteOpen}
      onOpen={() => setOwnersAutocompleteOpen(true)}
      onClose={() => setOwnersAutocompleteOpen(false)}
      onChange={onAutocompleteChange}
      onInputChange={onOwnersSearchInputChange}
      getOptionLabel={getOptionLabel}
      options={ownerOptions}
      filterOptions={getOwnerFilterOptions}
      loading={ownersLoading}
      isOptionEqualToValue={(option, value) => option.name === value.name}
      handleHomeEndKeys
      selectOnFocus
      blurOnSelect
      freeSolo
      clearIcon={<ClearIcon />}
      renderInput={params => (
        <AppTextField
          {...params}
          ref={params.InputProps.ref}
          label="Owner name"
          placeholder="Search name"
          customEndAdornment={{
            variant: 'loader',
            showAdornment: ownersLoading,
            position: { mr: 4 },
          }}
        />
      )}
      renderOption={(props, option) => (
        <li {...props}>
          <Typography variant="body2">
            {option.id ? (
              option.name
            ) : (
              <AutocompleteSuggestion
                optionLabel="owner"
                optionName={option.name}
              />
            )}
          </Typography>
        </li>
      )}
    />
  );
};

export default OwnershipFormOwnerAutocomplete;
