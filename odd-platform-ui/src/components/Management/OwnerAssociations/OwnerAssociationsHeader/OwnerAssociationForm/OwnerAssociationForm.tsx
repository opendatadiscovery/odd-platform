import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { Collector, UserOwnerMappingFormData } from 'generated-sources';
import { registerCollector, updateCollector } from 'redux/thunks';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import {
  getCollectorCreatingStatuses,
  getCollectorsUpdatingStatuses,
} from 'redux/selectors';
import {
  Button,
  DialogWrapper,
  Input,
  OwnerIdAutocomplete,
} from 'components/shared/elements';
import Asterisk from 'components/shared/styled-components/asterisk';
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
  // const dispatch = useAppDispatch();
  // const { isLoading: isCollectorCreating, isLoaded: isCollectorCreated } = useAppSelector(
  //   getCollectorCreatingStatuses
  // );
  // const { isLoading: isCollectorUpdating, isLoaded: isCollectorUpdated } = useAppSelector(
  //   getCollectorsUpdatingStatuses
  // );

  const {
    handleSubmit,
    control,
    reset,
    formState: { isValid },
  } = useForm<UserOwnerMappingFormData>({
    mode: 'all',
    reValidateMode: 'onChange',
    defaultValues: {},
  });

  const clearState = () => {
    reset();
  };

  const onSubmit = async (data: UserOwnerMappingFormData) => {
    console.log('UserOwnerMappingFormData', data);
    // await createUserOwnerMapping({
    //   userOwnerMappingFormData: data,
    // });
    // (collector
    //   ? dispatch(
    //       updateCollector({
    //         collectorId: collector.id,
    //         collectorFormData: parsedData,
    //       })
    //     )
    //   : dispatch(registerCollector({ collectorFormData: parsedData }))
    // ).then(() => {
    //   clearState();
    // });
  };

  const ownerAssociationFormTitle = (
    <Typography variant='h4' component='span'>
      Create association
    </Typography>
  );

  const ownerAssociationFormContent = () => (
    <form id='owner-association-create-form' onSubmit={handleSubmit(onSubmit)}>
      <Typography variant='subtitle2' fontSize='0.73rem' sx={{ mb: 1.5 }}>
        {t('Fields with the')} <Asterisk>*</Asterisk>
        {' symbol are required to save the Association'}
      </Typography>
      <Controller
        name='ownerId'
        control={control}
        rules={{ required: true }}
        render={({ field }) => <OwnerIdAutocomplete field={field} />}
      />
      <Controller
        name='oidcUsername'
        control={control}
        render={({ field }) => (
          <Input {...field} variant='main-m' sx={{ my: 1.5 }} label='User' />
        )}
      />
      <Controller
        name='provider'
        control={control}
        rules={{ required: false }}
        render={({ field }) => (
          // <OwnerAutocomplete field={field} disableOwnerCreating={!createOwner} />
          <div>provider autocomplete</div>
        )}
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
