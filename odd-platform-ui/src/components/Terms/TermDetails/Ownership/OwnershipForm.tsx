import React from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { Autocomplete, Typography } from '@mui/material';
import {
  Controller,
  ControllerRenderProps,
  useForm,
} from 'react-hook-form';
import {
  Owner,
  Ownership,
  OwnershipFormData,
  Role,
} from 'generated-sources';
import DialogWrapper from 'components/shared/DialogWrapper/DialogWrapper';
import {
  AutocompleteInputChangeReason,
  createFilterOptions,
  FilterOptionsState,
} from '@mui/material/useAutocomplete';
import LabeledInfoItem from 'components/shared/LabeledInfoItem/LabeledInfoItem';
import AutocompleteSuggestion from 'components/shared/AutocompleteSuggestion/AutocompleteSuggestion';
import AppButton from 'components/shared/AppButton/AppButton';
import AppInput from 'components/shared/AppInput/AppInput';

import ClearIcon from 'components/shared/Icons/ClearIcon';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { useAppParams } from 'lib/hooks';
import {
  createTermOwnership,
  fetchOwnersList,
  fetchRoleList,
  updateTermOwnership,
} from 'redux/thunks';
import { getTermDetailsOwnerUpdatingStatuses } from 'redux/selectors';

interface OwnershipFormProps {
  termDetailsOwnership?: Ownership;
  ownerEditBtn: JSX.Element;
}

const OwnershipForm: React.FC<OwnershipFormProps> = ({
  termDetailsOwnership,
  ownerEditBtn,
}) => {
  const dispatch = useAppDispatch();
  const { termId } = useAppParams();
  const searchOwners = fetchOwnersList;
  const searchRoles = fetchRoleList;

  const { isLoading: isOwnerUpdating } = useAppSelector(
    getTermDetailsOwnerUpdatingStatuses
  );

  // Owner Autocomplete
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
      dispatch(
        searchOwners({ page: 1, size: 30, query: ownersSearchText })
      )
        .unwrap()
        .then(({ items }) => {
          setOwnersLoading(false);
          setOwnerOptions(items);
        });
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
  }, [ownersAutocompleteOpen, ownersSearchText]);

  // Role Autocomplete
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
    [searchRoles, setRolesLoading, setRoleOptions, ownersSearchText]
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

  const getOptionLabel = React.useCallback(
    (option: RoleFilterOption | OwnerFilterOption) => {
      if (typeof option === 'string') {
        return option;
      }
      if ('name' in option && option.name) {
        return option.name;
      }
      return '';
    },
    []
  );

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
    field: ControllerRenderProps,
    data: string | null | OwnerFilterOption | RoleFilterOption
  ): void => {
    if (!data || typeof data === 'string') {
      field.onChange(data);
    } else {
      field.onChange(data.name);
    }
  };

  // Form
  const methods = useForm<OwnershipFormData>({
    mode: 'onChange',
    defaultValues: {
      ownerName: '',
      roleName: termDetailsOwnership?.role?.name || '',
    },
  });
  const initialFormState = { error: '', isSuccessfulSubmit: false };
  const [{ error, isSuccessfulSubmit }, setFormState] = React.useState<{
    error: string;
    isSuccessfulSubmit: boolean;
  }>(initialFormState);

  const resetState = React.useCallback(() => {
    setFormState(initialFormState);
    methods.reset();
  }, [setFormState]);

  const ownershipUpdate = (data: OwnershipFormData) => {
    (termDetailsOwnership
      ? dispatch(
          updateTermOwnership({
            termId,
            ownershipId: termDetailsOwnership.id,
            ownershipUpdateFormData: { roleName: data.roleName },
          })
        )
      : dispatch(
          createTermOwnership({
            termId,
            ownershipFormData: data,
          })
        )
    ).then(
      () => {
        setFormState({ ...initialFormState, isSuccessfulSubmit: true });
        resetState();
      },
      (response: Response) => {
        setFormState({
          ...initialFormState,
          error: response.statusText || 'Unable to update owner',
        });
      }
    );
  };

  const formTitle = (
    <Typography variant="h4" component="span">
      {termDetailsOwnership ? 'Edit' : 'Add'} owner
    </Typography>
  );

  const formContent = () => (
    <form
      id="term-owner-add-form"
      onSubmit={methods.handleSubmit(ownershipUpdate)}
    >
      {termDetailsOwnership ? (
        <LabeledInfoItem inline label="Owner:" labelWidth={2}>
          {termDetailsOwnership.owner.name}
        </LabeledInfoItem>
      ) : (
        <Controller
          name="ownerName"
          control={methods.control}
          defaultValue=""
          rules={{ required: true }}
          render={({ field }) => (
            <Autocomplete
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...field}
              fullWidth
              id="term-owners-name-search"
              open={ownersAutocompleteOpen}
              onOpen={() => setOwnersAutocompleteOpen(true)}
              onClose={() => setOwnersAutocompleteOpen(false)}
              onChange={(_, data) =>
                onAutocompleteChange(field as ControllerRenderProps, data)
              }
              onInputChange={onOwnersSearchInputChange}
              getOptionLabel={getOptionLabel}
              options={ownerOptions}
              filterOptions={getOwnerFilterOptions}
              loading={ownersLoading}
              isOptionEqualToValue={(option, value) =>
                option.name === value.name
              }
              handleHomeEndKeys
              selectOnFocus
              blurOnSelect
              freeSolo
              clearIcon={<ClearIcon />}
              renderInput={params => (
                <AppInput
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
          )}
        />
      )}
      <Controller
        name="roleName"
        control={methods.control}
        defaultValue={termDetailsOwnership?.role?.name || ''}
        rules={{ required: true, validate: value => !!value?.trim() }}
        render={({ field }) => (
          <Autocomplete
            {...field}
            fullWidth
            id="term-roles-name-search"
            open={rolesAutocompleteOpen}
            onOpen={() => setRolesAutocompleteOpen(true)}
            onClose={() => setRolesAutocompleteOpen(false)}
            onChange={(_, data) =>
              onAutocompleteChange(field as ControllerRenderProps, data)
            }
            onInputChange={onRolesSearchInputChange}
            getOptionLabel={getOptionLabel}
            options={rolesOptions}
            filterOptions={getRoleFilterOptions}
            loading={rolesLoading}
            isOptionEqualToValue={(option, value) =>
              option.name === value.name
            }
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
        )}
      />
    </form>
  );

  const ownerEditDialogActions = () => (
    <AppButton
      size="large"
      color="primary"
      type="submit"
      form="term-owner-add-form"
      fullWidth
      disabled={!methods.formState.isValid}
    >
      {termDetailsOwnership ? 'Edit' : 'Add'} owner
    </AppButton>
  );

  return (
    <DialogWrapper
      maxWidth="xs"
      renderOpenBtn={({ handleOpen }) =>
        React.cloneElement(ownerEditBtn, { onClick: handleOpen })
      }
      title={formTitle}
      renderContent={formContent}
      renderActions={ownerEditDialogActions}
      handleCloseSubmittedForm={isSuccessfulSubmit}
      isLoading={isOwnerUpdating}
      errorText={error}
      clearState={resetState}
      formSubmitHandler={methods.handleSubmit(ownershipUpdate)}
    />
  );
};

export default OwnershipForm;
