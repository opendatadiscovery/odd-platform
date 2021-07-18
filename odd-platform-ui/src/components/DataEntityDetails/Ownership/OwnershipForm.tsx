import React from 'react';
import { useDebouncedCallback } from 'use-debounce/lib';
import {
  Typography,
  TextField,
  CircularProgress,
} from '@material-ui/core';
import {
  useForm,
  Controller,
  ControllerRenderProps,
} from 'react-hook-form';
import {
  Owner,
  OwnerApiGetOwnerListRequest,
  DataEntityApiCreateOwnershipRequest,
  DataEntityApiUpdateOwnershipRequest,
  OwnerList,
  Ownership,
  OwnershipFormData,
  Role,
  RoleApiGetRoleListRequest,
  RoleList,
} from 'generated-sources';
import AppButton from 'components/shared/AppButton/AppButton';
import DialogWrapper from 'components/shared/DialogWrapper/DialogWrapper';
import {
  Autocomplete,
  AutocompleteInputChangeReason,
  createFilterOptions,
  FilterOptionsState,
} from '@material-ui/lab';
import LabeledInfoItem from 'components/shared/LabeledInfoItem/LabeledInfoItem';
import AutocompleteSuggestion from 'components/shared/AutocompleteSuggestion/AutocompleteSuggestion';
import { StylesType } from './OwnershipFormStyles';

interface OwnershipFormProps extends StylesType {
  dataEntityId: number;
  dataEntityOwnership?: Ownership;
  ownerEditBtn: JSX.Element;
  isUpdating: boolean;
  createDataEntityOwnership: (
    params: DataEntityApiCreateOwnershipRequest
  ) => Promise<Ownership>;
  updateDataEntityOwnership: (
    params: DataEntityApiUpdateOwnershipRequest
  ) => Promise<Ownership>;
  searchOwners: (
    params: OwnerApiGetOwnerListRequest
  ) => Promise<OwnerList>;
  searchRoles: (params: RoleApiGetRoleListRequest) => Promise<RoleList>;
}

const OwnershipForm: React.FC<OwnershipFormProps> = ({
  classes,
  dataEntityId,
  dataEntityOwnership,
  ownerEditBtn,
  isUpdating,
  createDataEntityOwnership,
  updateDataEntityOwnership,
  searchOwners,
  searchRoles,
}) => {
  // Owner Autocomplete
  type OwnerFilterOption = Omit<Owner, 'id' | 'name'> & Partial<Owner>;
  const [ownerOptions, setOwnerOptions] = React.useState<
    OwnerFilterOption[]
  >([]);
  const [
    ownersAutocompleteOpen,
    setOwnersAutocompleteOpen,
  ] = React.useState(false);
  const [ownersLoading, setOwnersLoading] = React.useState<boolean>(false);
  const [ownersSearchText, setOwnersSearchText] = React.useState<string>(
    ''
  );
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
  }, [ownersAutocompleteOpen, ownersSearchText]);

  // Role Autocomplete
  type RoleFilterOption = Omit<Role, 'id' | 'name'> & Partial<Role>;
  const [rolesOptions, setRoleOptions] = React.useState<
    RoleFilterOption[]
  >([]);
  const [rolesAutocompleteOpen, setRolesAutocompleteOpen] = React.useState(
    false
  );
  const [rolesLoading, setRolesLoading] = React.useState<boolean>(false);
  const [rolesSearchText, setRolesSearchText] = React.useState<string>('');
  const rolesFilter = createFilterOptions<RoleFilterOption>();

  const handleRolesSearch = React.useCallback(
    useDebouncedCallback(() => {
      setRolesLoading(true);
      searchRoles({ page: 1, size: 30, query: rolesSearchText }).then(
        response => {
          setRolesLoading(false);
          setRoleOptions(response.items);
        }
      );
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
  ) => {
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
      roleName: dataEntityOwnership?.role?.name || '',
    },
  });
  const initialFormState = { error: '', isSuccessfulSubmit: false };
  const [{ error, isSuccessfulSubmit }, setFormState] = React.useState<{
    error: string;
    isSuccessfulSubmit: boolean;
  }>(initialFormState);

  const resetState = React.useCallback(() => {
    setFormState(initialFormState);
  }, [setFormState]);

  const ownershipUpdate = (data: OwnershipFormData) => {
    (dataEntityOwnership
      ? updateDataEntityOwnership({
          dataEntityId,
          ownershipId: dataEntityOwnership.id,
          ownershipUpdateFormData: { roleName: data.roleName },
        })
      : createDataEntityOwnership({
          dataEntityId,
          ownershipFormData: data,
        })
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
    <Typography variant="h4">
      {dataEntityOwnership ? 'Edit' : 'Add'} owner
    </Typography>
  );

  const formContent = () => (
    <form
      id="owner-add-form"
      onSubmit={methods.handleSubmit(ownershipUpdate)}
      className={classes.form}
    >
      {dataEntityOwnership ? (
        <LabeledInfoItem
          classes={{
            container: classes.existingOwner,
            label: classes.existingOwnerLabel,
          }}
          inline
          label="Owner:"
          labelWidth="auto"
        >
          {dataEntityOwnership.owner.name}
        </LabeledInfoItem>
      ) : (
        <Controller
          name="ownerName"
          control={methods.control}
          defaultValue=""
          rules={{ required: true }}
          render={({ field }) => (
            <Autocomplete
              classes={{ root: classes.formField }}
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...field}
              fullWidth
              id="owners-name-search"
              open={ownersAutocompleteOpen}
              onOpen={() => setOwnersAutocompleteOpen(true)}
              onClose={() => setOwnersAutocompleteOpen(false)}
              onChange={(_, data) => onAutocompleteChange(field, data)}
              onInputChange={onOwnersSearchInputChange}
              getOptionLabel={getOptionLabel}
              options={ownerOptions}
              filterOptions={getOwnerFilterOptions}
              loading={ownersLoading}
              getOptionSelected={(option, value) =>
                option.name === value.name
              }
              handleHomeEndKeys
              selectOnFocus
              blurOnSelect
              freeSolo
              renderInput={params => (
                <TextField
                  {...params}
                  name="name"
                  label="Owner name"
                  placeholder="Search name"
                  variant="outlined"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {ownersLoading ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={option => (
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
              )}
            />
          )}
        />
      )}
      <Controller
        name="roleName"
        control={methods.control}
        defaultValue={dataEntityOwnership?.role?.name || ''}
        render={({ field }) => (
          <Autocomplete
            classes={{ root: classes.formField }}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...field}
            fullWidth
            id="roles-name-search"
            open={rolesAutocompleteOpen}
            onOpen={() => setRolesAutocompleteOpen(true)}
            onClose={() => setRolesAutocompleteOpen(false)}
            onChange={(_, data) => onAutocompleteChange(field, data)}
            onInputChange={onRolesSearchInputChange}
            getOptionLabel={getOptionLabel}
            options={rolesOptions}
            filterOptions={getRoleFilterOptions}
            loading={rolesLoading}
            getOptionSelected={(option, value) =>
              option.name === value.name
            }
            handleHomeEndKeys
            selectOnFocus
            blurOnSelect
            freeSolo
            renderInput={params => (
              <TextField
                {...params}
                name="roleName"
                label="Role"
                placeholder="Search role"
                variant="outlined"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {rolesLoading ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderOption={option => (
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
      form="owner-add-form"
      onClick={() => {}}
      fullWidth
      disabled={!methods.formState.isValid || !methods.formState.isDirty}
    >
      {dataEntityOwnership ? 'Edit' : 'Add'} owner
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
      isLoading={isUpdating}
      errorText={error}
    />
  );
};

export default OwnershipForm;
