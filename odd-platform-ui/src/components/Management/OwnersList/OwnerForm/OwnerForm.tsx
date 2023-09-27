import React from 'react';
import { Grid, Typography } from '@mui/material';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { Owner, OwnerFormData } from 'generated-sources';
import { Button, DialogWrapper, Input, TagItem } from 'components/shared/elements';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { createOwner, updateOwner } from 'redux/thunks';
import { getOwnerCreatingStatuses, getOwnerUpdatingStatuses } from 'redux/selectors';
import RoleAutocomplete from 'components/shared/elements/Autocomplete/RoleAutocomplete/RoleAutocomplete';

interface OwnerFormProps {
  btnCreateEl: JSX.Element;
  ownerId?: Owner['id'];
  name?: Owner['name'];
  roles?: Owner['roles'];
}

const OwnerForm: React.FC<OwnerFormProps> = ({ btnCreateEl, ownerId, name, roles }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { isLoading: isOwnerCreating, isLoaded: isOwnerCreated } = useAppSelector(
    getOwnerCreatingStatuses
  );
  const { isLoading: isOwnerUpdating, isLoaded: isOwnerUpdated } = useAppSelector(
    getOwnerUpdatingStatuses
  );

  const getDefaultValues = React.useCallback(
    (): OwnerFormData => ({ name: name || '', roles: roles || [] }),
    [name, roles]
  );

  const { control, formState, reset, handleSubmit } = useForm<OwnerFormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: getDefaultValues(),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'roles',
  });

  const clearState = React.useCallback(() => {
    reset();
  }, []);

  const updateState = () => reset({ name, roles });

  const handleOwnerFormSubmit = async (ownerFormData: OwnerFormData) => {
    (ownerId
      ? dispatch(updateOwner({ ownerId, ownerFormData }))
      : dispatch(createOwner({ ownerFormData }))
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
      {ownerId ? t('Edit owner') : t('Add owner')}
    </Typography>
  );

  const formContent = () => (
    <form id='owner-create-form' onSubmit={handleSubmit(handleOwnerFormSubmit)}>
      <Controller
        name='name'
        control={control}
        defaultValue={name || ''}
        rules={{ required: true, validate: value => !!value.trim() }}
        render={({ field }) => (
          <Input
            {...field}
            variant='main-m'
            label={t('Name')}
            placeholder={t('Owner Name')}
          />
        )}
      />
      <RoleAutocomplete append={append} sx={{ mt: 1.5 }} />
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
      text={ownerId ? t('Save') : t('Add new owner')}
      type='submit'
      form='owner-create-form'
      buttonType='main-lg'
      fullWidth
      disabled={!formState.isValid}
    />
  );

  const handleOnOpen = React.useCallback(
    (handleOpen: () => void) => () => {
      if (ownerId) updateState();
      else clearState();
      handleOpen();
    },
    [clearState]
  );

  return (
    <DialogWrapper
      maxWidth='xs'
      renderOpenBtn={({ handleOpen }) =>
        React.cloneElement(btnCreateEl, { onClick: handleOnOpen(handleOpen) })
      }
      title={formTitle}
      renderContent={formContent}
      renderActions={formActionButtons}
      handleCloseSubmittedForm={ownerId ? isOwnerUpdated : isOwnerCreated}
      isLoading={ownerId ? isOwnerUpdating : isOwnerCreating}
      clearState={clearState}
    />
  );
};

export default OwnerForm;
