import React from 'react';
import { Typography } from '@mui/material';
import { FormProvider, useForm } from 'react-hook-form';
import { type MetadataObject } from 'generated-sources';
import { Button, DialogWrapper } from 'components/shared/elements';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { createDataEntityCustomMetadata } from 'redux/thunks';
import { getDataEntityMetadataCreatingStatuses } from 'redux/selectors';
import MetadataCreateFormItem from './MetadataCreateFormItem/MetadataCreateFormItem';

interface MetadataCreateFormProps {
  dataEntityId: number;
  btnCreateEl: JSX.Element;
}

const MetadataCreateForm: React.FC<MetadataCreateFormProps> = ({
  dataEntityId,
  btnCreateEl,
}) => {
  const dispatch = useAppDispatch();
  const { isLoading: isMetadataCreating, isLoaded: isMetadataCreated } = useAppSelector(
    getDataEntityMetadataCreatingStatuses
  );

  const methods = useForm<{ metadata: MetadataObject }>({
    mode: 'onChange',
    defaultValues: { metadata: {} },
  });

  const clearState = () => {
    methods.reset();
  };

  const createMetadata = (data: { metadata: MetadataObject }) => {
    dispatch(
      createDataEntityCustomMetadata({
        dataEntityId,
        metadataObject: [data.metadata],
      })
    ).then(() => {
      clearState();
    });
  };

  const formTitle = (
    <Typography variant='h4' component='span'>
      Add Custom Metadata
    </Typography>
  );

  const formContent = () => (
    <FormProvider {...methods}>
      <form id='metadata-create-form' onSubmit={methods.handleSubmit(createMetadata)}>
        <MetadataCreateFormItem />
      </form>
    </FormProvider>
  );

  const formActionButtons = () => (
    <Button
      text='Add'
      buttonType='main-lg'
      type='submit'
      form='metadata-create-form'
      fullWidth
      disabled={!methods.formState.isValid}
    />
  );

  return (
    <DialogWrapper
      maxWidth='xs'
      renderOpenBtn={({ handleOpen }) =>
        React.cloneElement(btnCreateEl, { onClick: handleOpen })
      }
      title={formTitle}
      renderContent={formContent}
      renderActions={formActionButtons}
      handleCloseSubmittedForm={isMetadataCreated}
      isLoading={isMetadataCreating}
      clearState={clearState}
      formSubmitHandler={methods.handleSubmit(createMetadata)}
    />
  );
};

export default MetadataCreateForm;
