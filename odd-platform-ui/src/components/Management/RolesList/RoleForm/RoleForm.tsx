import React from 'react';
import { Grid, Typography } from '@mui/material';
import { Controller, FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { Role, RoleFormData } from 'generated-sources';
import {
  AppButton,
  AppInput,
  DialogWrapper,
  PolicyAutocomplete,
  TagItem,
} from 'components/shared';
import { ClearIcon } from 'components/shared/Icons';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { createRole, updateRole } from 'redux/thunks';
import { getRoleCreatingStatuses, getRoleUpdatingStatuses } from 'redux/selectors';

interface RoleFormProps {
  openBtn: JSX.Element;
  roleId?: Role['id'];
  name?: Role['name'];
  policies?: Role['policies'];
}

const RoleForm: React.FC<RoleFormProps> = ({ openBtn, roleId, name, policies }) => {
  const dispatch = useAppDispatch();
  const { isLoading: isRoleCreating } = useAppSelector(getRoleCreatingStatuses);
  const { isLoading: isRoleUpdating } = useAppSelector(getRoleUpdatingStatuses);

  const methods = useForm<RoleFormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: { name, policies },
  });

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: 'policies',
    rules: { required: true },
  });

  const initialState = { error: '', isSuccessfulSubmit: false };
  const [{ error, isSuccessfulSubmit }, setState] = React.useState<{
    error: string;
    isSuccessfulSubmit: boolean;
  }>(initialState);

  const clearState = React.useCallback(() => {
    setState(initialState);
    methods.reset({ name, policies });
  }, [name, policies]);

  const handleRoleFormSubmit = (roleFormData: RoleFormData) => {
    (roleId
      ? dispatch(updateRole({ roleId, roleFormData }))
      : dispatch(createRole({ roleFormData }))
    ).then(
      () => {
        setState({ ...initialState, isSuccessfulSubmit: true });
        clearState();
      },
      (response: Response) => {
        setState({
          ...initialState,
          error:
            response.statusText || roleId
              ? 'Unable to update role'
              : 'Role already exists',
        });
      }
    );
  };

  const handleRemove = React.useCallback(
    (index: number) => () => remove(index),
    [remove]
  );

  const formTitle = (
    <Typography variant='h4' component='span'>
      {roleId ? 'Edit' : 'Create'} role
    </Typography>
  );

  const formContent = () => (
    <FormProvider {...methods}>
      <form id='role-form' onSubmit={methods.handleSubmit(handleRoleFormSubmit)}>
        <Controller
          name='name'
          control={methods.control}
          defaultValue={name}
          rules={{ required: true, validate: value => !!value.trim() }}
          render={({ field }) => (
            <AppInput
              {...field}
              label='Name'
              placeholder='Enter role name'
              customEndAdornment={{
                variant: 'clear',
                showAdornment: !!field.value,
                onCLick: () => field.onChange(''),
                icon: <ClearIcon />,
              }}
            />
          )}
        />
        <PolicyAutocomplete append={append} sx={{ mt: 1.5 }} />
        <Grid
          container
          alignItems='center'
          justifyContent='flex-start'
          flexWrap='wrap'
          mt={1.5}
        >
          {fields.map((field, idx) => (
            <TagItem
              sx={{ my: 0.5, mr: 0.5 }}
              key={field.id}
              label={field.name}
              removable
              onRemoveClick={handleRemove(idx)}
            />
          ))}
        </Grid>
      </form>
    </FormProvider>
  );

  const formActionButtons = () => (
    <AppButton
      size='large'
      type='submit'
      form='role-form'
      color='primary'
      fullWidth
      disabled={!methods.formState.isValid}
      isLoading={roleId ? isRoleUpdating : isRoleCreating}
    >
      {roleId ? 'Save' : 'Create role'}
    </AppButton>
  );

  const handleOnOpen = React.useCallback(
    (handleOpen: () => void) => {
      clearState();
      handleOpen();
    },
    [clearState]
  );

  return (
    <DialogWrapper
      maxWidth='xs'
      renderOpenBtn={({ handleOpen }) =>
        React.cloneElement(openBtn, { onClick: handleOnOpen(handleOpen) })
      }
      title={formTitle}
      renderContent={formContent}
      renderActions={formActionButtons}
      handleCloseSubmittedForm={isSuccessfulSubmit}
      isLoading={roleId ? isRoleUpdating : isRoleCreating}
      errorText={error}
      clearState={clearState}
    />
  );
};

export default RoleForm;
