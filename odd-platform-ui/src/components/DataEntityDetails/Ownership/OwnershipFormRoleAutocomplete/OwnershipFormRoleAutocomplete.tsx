import React from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { Autocomplete, Typography } from '@mui/material';
import { ControllerRenderProps } from 'react-hook-form';
import { OwnershipFormData, Role } from 'generated-sources';
import {
  AutocompleteInputChangeReason,
  createFilterOptions,
  FilterOptionsState,
} from '@mui/material/useAutocomplete';
import AutocompleteSuggestion from 'components/shared/AutocompleteSuggestion/AutocompleteSuggestion';
import AppInput from 'components/shared/AppInput/AppInput';

import ClearIcon from 'components/shared/Icons/ClearIcon';
import { useAppDispatch } from 'redux/lib/hooks';
import { fetchRoleList } from 'redux/thunks';

interface OwnershipFormRoleAutocompleteProps {
  field: ControllerRenderProps<OwnershipFormData, 'roleName'>;
}

const OwnershipFormRoleAutocomplete: React.FC<
  OwnershipFormRoleAutocompleteProps
> = ({ field }) => {
  const dispatch = useAppDispatch();
  const searchRoles = fetchRoleList;

  type RoleFilterOption = Omit<Role, 'id' | 'name'> & Partial<Role>;
  const [rolesOptions, setRoleOptions] = React.useState<
    RoleFilterOption[]
  >([]);
  const [rolesAutocompleteOpen, setRolesAutocompleteOpen] =
    React.useState(false);
  const [rolesLoading, setRolesLoading] = React.useState<boolean>(false);
  const [rolesSearchText, setRolesSearchText] = React.useState<string>('');
  const rolesFilter = createFilterOptions<RoleFilterOption>();

  const handleRolesSearch = React.useCallback(
    useDebouncedCallback(() => {
      setRolesLoading(true);
      dispatch(searchRoles({ page: 1, size: 30, query: rolesSearchText }))
        .unwrap()
        .then(({ roleList }) => {
          setRolesLoading(false);
          setRoleOptions(roleList);
        });
    }, 500),
    [searchRoles, setRolesLoading, setRoleOptions]
  );

  const onRolesSearchInputChange = React.useCallback(
    (
      _: React.ChangeEvent<unknown>,
      query: string,
      reason: AutocompleteInputChangeReason
    ) => {
      if (reason === 'input') {
        setRolesSearchText(query);
      } else {
        setRolesSearchText(''); // Clear input on select
      }
    },
    [setRolesSearchText]
  );

  React.useEffect(() => {
    setRolesLoading(rolesAutocompleteOpen);
    if (rolesAutocompleteOpen) {
      handleRolesSearch();
    }
  }, [rolesAutocompleteOpen, rolesSearchText]);

  const getOptionLabel = React.useCallback((option: RoleFilterOption) => {
    if (typeof option === 'string') {
      return option;
    }
    if ('name' in option && option.name) {
      return option.name;
    }
    return '';
  }, []);

  const getRoleFilterOptions = (
    filterOptions: RoleFilterOption[],
    params: FilterOptionsState<RoleFilterOption>
  ) => {
    const filtered = rolesFilter(filterOptions, params);
    if (
      rolesSearchText !== '' &&
      !rolesLoading &&
      !filterOptions.some(option => option.name === rolesSearchText)
    ) {
      return [...filtered, { name: rolesSearchText }];
    }
    return filtered;
  };

  const onAutocompleteChange = (
    _: React.SyntheticEvent,
    data: string | null | RoleFilterOption
  ): void => {
    if (!data || typeof data === 'string') {
      field.onChange(data);
    } else {
      field.onChange(data.name);
    }
  };

  return (
    <Autocomplete
      {...field}
      fullWidth
      id="roles-name-search"
      open={rolesAutocompleteOpen}
      onOpen={() => setRolesAutocompleteOpen(true)}
      onClose={() => setRolesAutocompleteOpen(false)}
      onChange={onAutocompleteChange}
      onInputChange={onRolesSearchInputChange}
      getOptionLabel={getOptionLabel}
      options={rolesOptions}
      filterOptions={getRoleFilterOptions}
      loading={rolesLoading}
      isOptionEqualToValue={(option, value) => option.name === value.name}
      handleHomeEndKeys
      selectOnFocus
      blurOnSelect
      freeSolo
      clearIcon={<ClearIcon />}
      renderInput={params => (
        <AppInput
          {...params}
          sx={{ mt: 1.5 }}
          ref={params.InputProps.ref}
          label="Role"
          placeholder="Search role"
          customEndAdornment={{
            variant: 'loader',
            showAdornment: rolesLoading,
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
                optionLabel="role"
                optionName={option.name}
              />
            )}
          </Typography>
        </li>
      )}
    />
  );
};

export default OwnershipFormRoleAutocomplete;
