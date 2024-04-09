import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { UserOwnerMappingFormData } from 'generated-sources';
import {
  Button,
  DialogWrapper,
  Input,
  OwnerIdAutocomplete,
  ProviderAutocomplete,
} from 'components/shared/elements';
import { useCreateUserOwnerMapping } from 'lib/hooks';

interface OwnerAssociationFormProps {
  btnCreateEl: React.JSX.Element;
}

const OwnerAssociationForm: React.FC<OwnerAssociationFormProps> = ({ btnCreateEl }) => {
  const { t } = useTranslation();

  const {
    mutateAsync: createUserOwnerMapping,
    isPending: isAssociationCreating,
    isSuccess,
  } = useCreateUserOwnerMapping();

  const {
    handleSubmit,
    control,
    reset,
    formState: { isValid },
  } = useForm<UserOwnerMappingFormData>({
    mode: 'all',
    reValidateMode: 'onChange',
  });

  const clearState = () => {
    reset();
  };

  const onSubmit = async (data: UserOwnerMappingFormData) => {
    await createUserOwnerMapping({
      userOwnerMappingFormData: data,
    });
  };

  const ownerAssociationFormTitle = (
    <Typography variant='h4' component='span'>
      Create association
    </Typography>
  );

  const ownerAssociationFormContent = () => (
    <form id='owner-association-create-form' onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name='ownerId'
        control={control}
        rules={{ required: true }}
        render={({ field }) => <OwnerIdAutocomplete field={field} />}
      />
      <Controller
        name='oidcUsername'
        control={control}
        defaultValue=''
        rules={{ required: true }}
        render={({ field }) => (
          <Input
            {...field}
            variant='main-m'
            sx={{ my: 1.5 }}
            label='User'
            placeholder='Enter username'
          />
        )}
      />
      <Controller
        name='provider'
        control={control}
        defaultValue=''
        rules={{
          required: true,
        }}
        render={({ field }) => <ProviderAutocomplete field={field} />}
      />
    </form>
  );

  const ownerAssociationFormActionButtons = () => (
    <Button
      text={t('Save')}
      type='submit'
      form='owner-association-create-form'
      buttonType='main-lg'
      fullWidth
      disabled={!isValid}
    />
  );

  return (
    <DialogWrapper
      renderOpenBtn={({ handleOpen }) =>
        React.cloneElement(btnCreateEl, { onClick: handleOpen })
      }
      title={ownerAssociationFormTitle}
      renderContent={ownerAssociationFormContent}
      renderActions={ownerAssociationFormActionButtons}
      handleCloseSubmittedForm={isSuccess}
      isLoading={isAssociationCreating}
      clearState={clearState}
      confirmOnClose
    />
  );
};

export default OwnerAssociationForm;
