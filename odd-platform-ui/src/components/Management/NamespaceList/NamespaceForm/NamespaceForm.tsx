import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { Namespace, NamespaceFormData } from 'generated-sources';
import { Button, DialogWrapper, Input } from 'components/shared/elements';
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
  const { t } = useTranslation();
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
      {namespace ? t('Edit namespace') : t('Add namespace')}
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
          <Input {...field} variant='main-m' placeholder={t('Enter namespace name')} />
        )}
      />
    </form>
  );

  const formActionButtons = () => (
    <Button
      text={t('Save')}
      type='submit'
      form='namespace-edit-form'
      buttonType='main-lg'
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
