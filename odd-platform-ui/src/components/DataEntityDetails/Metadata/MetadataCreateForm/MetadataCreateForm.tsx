import React from 'react';
import { Typography } from '@mui/material';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { MetadataField, MetadataObject } from 'generated-sources';
import DialogWrapper from 'components/shared/DialogWrapper/DialogWrapper';
import AppButton from 'components/shared/AppButton/AppButton';
import { useAppDispatch } from 'lib/hooks';
import { createDataEntityCustomMetadata } from 'redux/thunks/metadata.thunks';
import MetadataCreateFormItem from './MetadataCreateFormItem/MetadataCreateFormItem';

interface MetadataCreateFormProps {
  dataEntityId: number;
  metadataOptions: MetadataField[];
  isLoading: boolean;
  btnCreateEl: JSX.Element;
}

const MetadataCreateForm: React.FC<MetadataCreateFormProps> = ({
  dataEntityId,
  isLoading,
  btnCreateEl,
}) => {
  const dispatch = useAppDispatch();

  const methods = useForm<{ metadata: MetadataObject[] }>({
    mode: 'onChange',
    defaultValues: {
      metadata: [{}],
    },
  });
  const { fields } = useFieldArray({
    control: methods.control,
    name: 'metadata',
  });

  const initialState = { error: '', isSuccessfulSubmit: false };

  const [{ error, isSuccessfulSubmit }, setState] = React.useState<{
    error: string;
    isSuccessfulSubmit: boolean;
  }>(initialState);

  const clearState = () => {
    setState(initialState);
    methods.reset();
  };

  const createMetadata = (data: { metadata: MetadataObject[] }) => {
    dispatch(
      createDataEntityCustomMetadata({
        dataEntityId,
        metadataObject: data.metadata,
      })
    ).then(
      () => {
        setState({ ...initialState, isSuccessfulSubmit: true });
        clearState();
      },
      (response: Response) => {
        setState({
          ...initialState,
          error: response.statusText || 'Unable to create metadata',
        });
      }
    );
  };

  const formTitle = (
    <Typography variant="h4" component="span">
      Add Custom Metadata
    </Typography>
  );

  const formContent = () => (
    <FormProvider {...methods}>
      <form
        id="metadata-create-form"
        onSubmit={methods.handleSubmit(createMetadata)}
      >
        {fields.map((item, index) => (
          <MetadataCreateFormItem key={item.id} itemIndex={index} />
        ))}
      </form>
    </FormProvider>
  );

  const formActionButtons = () => (
    <AppButton
      type="submit"
      size="large"
      color="primary"
      form="metadata-create-form"
      fullWidth
      disabled={!methods.formState.isValid}
    >
      Add
    </AppButton>
  );

  return (
    <DialogWrapper
      maxWidth="xs"
      renderOpenBtn={({ handleOpen }) =>
        React.cloneElement(btnCreateEl, { onClick: handleOpen })
      }
      title={formTitle}
      renderContent={formContent}
      renderActions={formActionButtons}
      handleCloseSubmittedForm={isSuccessfulSubmit}
      isLoading={isLoading}
      errorText={error}
    />
  );
};

export default MetadataCreateForm;
