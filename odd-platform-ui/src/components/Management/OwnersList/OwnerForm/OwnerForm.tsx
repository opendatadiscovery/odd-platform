import React from 'react';
import { Grid, Typography } from '@mui/material';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { Owner, OwnerFormData } from 'generated-sources';
import { AppButton, AppInput, DialogWrapper, TagItem } from 'components/shared';
import { ClearIcon } from 'components/shared/Icons';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { createOwner, updateOwner } from 'redux/thunks';
import { getOwnerCreatingStatuses } from 'redux/selectors';
import RoleAutocomplete from 'components/shared/Autocomplete/RoleAutocomplete/RoleAutocomplete';

interface OwnerFormProps {
  btnCreateEl: JSX.Element;
  ownerId?: Owner['id'];
  name?: Owner['name'];
  roles?: Owner['roles'];
}

const OwnerForm: React.FC<OwnerFormProps> = ({ btnCreateEl, ownerId, name, roles }) => {
  const dispatch = useAppDispatch();
  const { isLoading: isOwnerCreating } = useAppSelector(getOwnerCreatingStatuses);

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
    rules: { required: true },
  });

  const initialState = { error: '', isSuccessfulSubmit: false };
  const [{ error, isSuccessfulSubmit }, setState] = React.useState<{
    error: string;
    isSuccessfulSubmit: boolean;
  }>(initialState);

  const clearState = React.useCallback(() => {
    setState(initialState);
    reset();
  }, [setState, initialState]);

  const updateState = () => reset({ name, roles });

  const handleOwnerFormSubmit = async (ownerFormData: OwnerFormData) => {
    (ownerId
      ? dispatch(updateOwner({ ownerId, ownerFormData }))
      : dispatch(createOwner({ ownerFormData }))
    ).then(
      () => {
        setState({ ...initialState, isSuccessfulSubmit: true });
        clearState();
      },
      (response: Response) => {
        setState({
          ...initialState,
          error:
            response.statusText || ownerId
              ? 'Unable to update owner'
              : 'Owner already exists',
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
      {ownerId ? 'Edit' : 'Add'} Owner
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
          <AppInput
            {...field}
            label='Name'
            placeholder='Owner Name'
            customEndAdornment={{
              variant: 'clear',
              showAdornment: !!field.value,
              onCLick: () => field.onChange(''),
              icon: <ClearIcon />,
            }}
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
    <AppButton
      size='large'
      type='submit'
      form='owner-create-form'
      color='primary'
      fullWidth
      disabled={!formState.isValid}
    >
      {ownerId ? 'Save' : 'Add new owner'}
    </AppButton>
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
      handleCloseSubmittedForm={isSuccessfulSubmit}
      isLoading={isOwnerCreating}
      errorText={error}
      clearState={clearState}
    />
  );
};

export default OwnerForm;
