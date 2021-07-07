import React from 'react';
import {
  Grid,
  Typography,
  TextField,
  CircularProgress,
} from '@material-ui/core';
import {
  Controller,
  ControllerRenderProps,
  useForm,
} from 'react-hook-form';
import { useDebouncedCallback } from 'use-debounce';
import {
  Autocomplete,
  AutocompleteInputChangeReason,
  createFilterOptions,
  FilterOptionsState,
} from '@material-ui/lab';
import {
  AssociatedOwner,
  Owner,
  OwnerList,
  OwnerApiGetOwnerListRequest,
  OwnerFormData,
  IdentityApiAssociateOwnerRequest,
} from 'generated-sources';
import UserSyncIcon from 'components/shared/Icons/UserSyncIcon';
import AppButton from 'components/shared/AppButton/AppButton';
import { StylesType } from './IdentityStyles';

interface IdentityProps extends StylesType {
  identity?: AssociatedOwner;
  searchOwners: (
    params: OwnerApiGetOwnerListRequest
  ) => Promise<OwnerList>;
  updateIdentityOwner: (
    params: IdentityApiAssociateOwnerRequest
  ) => Promise<void | AssociatedOwner>;
}

const Identity: React.FC<IdentityProps> = ({
  classes,
  identity,
  searchOwners,
  updateIdentityOwner,
}) => {
  const methods = useForm<OwnerFormData>({
    mode: 'onChange',
    defaultValues: {
      name: '',
    },
  });

  const [possibleOwners, setPossibleOwners] = React.useState<Owner[]>([]);

  type FilterOption = Omit<Owner, 'id' | 'name'> & Partial<Owner>;
  const [options, setOptions] = React.useState<FilterOption[]>([]);
  const [autocompleteOpen, setAutocompleteOpen] = React.useState(false);
  const [optionsLoading, setOptionsLoading] = React.useState<boolean>(
    false
  );
  const [optionsSearchText, setOptionsSearchText] = React.useState<string>(
    ''
  );
  const ownersFilter = createFilterOptions<FilterOption>();

  const handleOwnersSearch = React.useCallback(
    useDebouncedCallback(() => {
      setOptionsLoading(true);
      searchOwners({ page: 1, size: 30, query: optionsSearchText }).then(
        response => {
          setOptionsLoading(false);
          setOptions(response.items);
        }
      );
    }, 500),
    [searchOwners, setOptionsLoading, setOptions, optionsSearchText]
  );

  const onSearchInputChange = React.useCallback(
    (
      _: React.ChangeEvent<unknown>,
      query: string,
      reason: AutocompleteInputChangeReason
    ) => {
      if (reason === 'input') {
        setOptionsSearchText(query);
      }
    },
    [setOptionsSearchText]
  );

  const getFilterOptions = (
    filterOptions: FilterOption[],
    params: FilterOptionsState<FilterOption>
  ) => {
    const filtered = ownersFilter(filterOptions, params);
    if (
      optionsSearchText !== '' &&
      !optionsLoading &&
      !filterOptions.some(option => option.name === optionsSearchText)
    ) {
      return [...filtered, { name: optionsSearchText }];
    }
    return filtered;
  };

  const getOptionLabel = React.useCallback((option: FilterOption) => {
    if (typeof option === 'string') {
      return option;
    }
    if ('name' in option && option.name) {
      return option.name;
    }
    return '';
  }, []);

  const onAutocompleteChange = (
    field: ControllerRenderProps<OwnerFormData>,
    option: FilterOption | string | null
  ) => {
    if (!option || typeof option === 'string') {
      field.onChange(option);
    } else {
      field.onChange(option.name);
    }
  };

  React.useEffect(() => {
    setOptionsLoading(autocompleteOpen);
    if (autocompleteOpen) {
      handleOwnersSearch();
    }
  }, [autocompleteOpen, optionsSearchText]);

  const onSubmit = (data: OwnerFormData) => {
    updateIdentityOwner({ ownerFormData: data });
  };

  React.useEffect(() => {
    if (!identity?.identity.username) return;
    searchOwners({
      page: 1,
      size: 30,
      query: identity?.identity.username,
    }).then(response => {
      setPossibleOwners(response.items);
    });
  }, [identity]);

  return (
    <div className={classes.container}>
      <Grid container>
        <Grid item xs={12} container justify="center">
          <UserSyncIcon classes={{ root: classes.captionIcon }} />
        </Grid>
        <Grid
          item
          xs={12}
          container
          alignItems="center"
          className={classes.caption}
          direction="column"
        >
          <Typography variant="h3">
            {identity?.identity.username ? (
              <>Hi {identity?.identity.username}.</>
            ) : null}{' '}
            Sync your account with existing owner.
          </Typography>
          <Typography variant="subtitle2">
            This will allow you to bind existing entities in your account.
          </Typography>
        </Grid>
        <Grid
          item
          xs={12}
          container
          alignItems="center"
          direction="column"
        >
          <form
            id="owner-connect-form"
            onSubmit={methods.handleSubmit(onSubmit)}
            className={classes.formContainer}
          >
            <Controller
              name="name"
              control={methods.control}
              defaultValue=""
              rules={{ required: true }}
              render={({ field }) => (
                <Autocomplete
                  // eslint-disable-next-line react/jsx-props-no-spreading
                  {...field}
                  fullWidth
                  id="owners-name-search"
                  open={autocompleteOpen}
                  onOpen={() => setAutocompleteOpen(true)}
                  onClose={() => setAutocompleteOpen(false)}
                  onChange={(_, data) => onAutocompleteChange(field, data)}
                  onInputChange={onSearchInputChange}
                  getOptionLabel={getOptionLabel}
                  options={options}
                  filterOptions={getFilterOptions}
                  loading={optionsLoading}
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
                            {optionsLoading ? (
                              <CircularProgress
                                color="inherit"
                                size={20}
                              />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  renderOption={option => (
                    <Typography variant="body2">
                      {option.id
                        ? option.name
                        : `No result. Create new owner "${option.name}"`}
                    </Typography>
                  )}
                />
              )}
            />
            <AppButton
              className={classes.submitBtn}
              size="large"
              color="primary"
              type="submit"
              form="owner-connect-form"
              onClick={() => {}}
              fullWidth
              disabled={
                !methods.formState.isValid || !methods.formState.isDirty
              }
            >
              Sync owner
            </AppButton>
          </form>
        </Grid>
        {possibleOwners.length ? (
          <Grid item xs={12} container>
            <Typography variant="subtitle2">
              Maybe it&apos;s you
            </Typography>
            {possibleOwners.map(owner => (
              <Typography variant="body1">{owner.name}</Typography>
            ))}
          </Grid>
        ) : null}
      </Grid>
    </div>
  );
};

export default Identity;
