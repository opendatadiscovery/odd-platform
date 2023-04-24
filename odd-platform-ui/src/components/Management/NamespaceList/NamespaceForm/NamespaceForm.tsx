import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { Namespace, NamespaceFormData } from 'generated-sources';
import { Typography } from '@mui/material';
import { Button, AppInput, DialogWrapper } from 'components/shared/elements';
import { ClearIcon } from 'components/shared/icons';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { createNamespace, updateNamespace } from 'redux/thunks';
import {
  getNamespaceCreatingStatuses,
  getNamespaceUpdatingStatuses,
} from 'redux/selectors';

interface NamespaceFormProps {
  btnEl: JSX.Element;
  namespace?: Namespace;
}

const NamespaceForm: React.FC<NamespaceFormProps> = ({ btnEl, namespace }) => {
  const dispatch = useAppDispatch();

  const { isLoading: isNamespaceCreating, isLoaded: isNamespaceCreated } = useAppSelector(
    getNamespaceCreatingStatuses
  );
  const { isLoading: isNamespaceUpdating, isLoaded: isNamespaceUpdated } = useAppSelector(
    getNamespaceUpdatingStatuses
  );

  const { control, handleSubmit, reset, formState } = useForm<NamespaceFormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const clearState = () => {
    reset();
  };

  const handleUpdate = (data: NamespaceFormData) => {
    (namespace
      ? dispatch(
          updateNamespace({
            namespaceId: namespace.id,
            namespaceUpdateFormData: data,
          })
        )
      : dispatch(createNamespace({ namespaceFormData: data }))
    ).then(() => {
      clearState();
    });
  };

  const formTitle = (
    <Typography variant='h4' component='span'>
      {namespace ? 'Edit' : 'Add'} Namespace
    </Typography>
  );

  const formContent = () => (
    <form id='namespace-edit-form' onSubmit={handleSubmit(handleUpdate)}>
      <Controller
        name='name'
        control={control}
        defaultValue={namespace?.name || ''}
        rules={{ required: true, validate: value => !!value.trim() }}
        render={({ field }) => (
          <AppInput
            {...field}
            placeholder='Namespace Name'
            customEndAdornment={{
              variant: 'clear',
              showAdornment: !!field.value,
              onCLick: () => field.onChange(''),
              icon: <ClearIcon />,
            }}
          />
        )}
      />
    </form>
  );

  const formActionButtons = () => (
    <Button
      text='Save'
      size='lg'
      type='submit'
      form='namespace-edit-form'
      color='main'
      fullWidth
      disabled={!formState.isValid}
    />
  );

  return (
    <DialogWrapper
      maxWidth='xs'
      renderOpenBtn={({ handleOpen }) =>
        React.cloneElement(btnEl, { onClick: handleOpen })
      }
      title={formTitle}
      renderContent={formContent}
      renderActions={formActionButtons}
      handleCloseSubmittedForm={namespace ? isNamespaceUpdated : isNamespaceCreated}
      isLoading={isNamespaceCreating || isNamespaceUpdating}
      clearState={clearState}
    />
  );
};

export default NamespaceForm;
