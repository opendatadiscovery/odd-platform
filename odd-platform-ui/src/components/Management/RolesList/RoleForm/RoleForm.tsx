import React from 'react';
import { Grid, Typography } from '@mui/material';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import type { Role, RoleFormData } from 'generated-sources';
import {
  Button,
  AppInput,
  DialogWrapper,
  PolicyAutocomplete,
  TagItem,
} from 'components/shared/elements';
import { ClearIcon } from 'components/shared/icons';
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

  const isUser = name === 'User';

  const { isLoading: isRoleCreating, isLoaded: isRoleCreated } = useAppSelector(
    getRoleCreatingStatuses
  );
  const { isLoading: isRoleUpdating, isLoaded: isRoleUpdated } = useAppSelector(
    getRoleUpdatingStatuses
  );

  const getDefaultValues = React.useCallback(
    (): RoleFormData => ({ name: name || '', policies: policies || [] }),
    [name, policies]
  );

  const { control, formState, reset, handleSubmit } = useForm<RoleFormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: getDefaultValues(),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'policies',
  });

  const clearState = React.useCallback(() => {
    reset();
  }, []);

  const updateState = () => reset({ name, policies });

  const handleRoleFormSubmit = (roleFormData: RoleFormData) => {
    (roleId
      ? dispatch(updateRole({ roleId, roleFormData }))
      : dispatch(createRole({ roleFormData }))
    ).then(() => {
      clearState();
    });
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
    <form id='role-form' onSubmit={handleSubmit(handleRoleFormSubmit)}>
      <Controller
        name='name'
        control={control}
        defaultValue={name}
        rules={{ required: true, validate: value => !!value.trim() }}
        render={({ field }) => (
          <AppInput
            {...field}
            disabled={isUser}
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
  );

  const formActionButtons = () => (
    <Button
      text={roleId ? 'Save' : 'Create role'}
      type='submit'
      form='role-form'
      buttonType='main-lg'
      fullWidth
      disabled={!formState.isValid}
      isLoading={roleId ? isRoleUpdating : isRoleCreating}
    />
  );

  const handleOnOpen = React.useCallback(
    (handleOpen: () => void) => () => {
      if (roleId) updateState();
      else clearState();
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
      handleCloseSubmittedForm={roleId ? isRoleUpdated : isRoleCreated}
      isLoading={roleId ? isRoleUpdating : isRoleCreating}
      clearState={clearState}
    />
  );
};

export default RoleForm;
