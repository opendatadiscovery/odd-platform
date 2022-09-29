import React from 'react';
import { Typography } from '@mui/material';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { MetadataObject } from 'generated-sources';
import { AppButton, DialogWrapper } from 'components/shared';
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
  const { isLoading: isMetadataCreating } = useAppSelector(
    getDataEntityMetadataCreatingStatuses
  );

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
      size="large"
      type="submit"
      form="metadata-create-form"
      color="primary"
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
      isLoading={isMetadataCreating}
      errorText={error}
      clearState={clearState}
      formSubmitHandler={methods.handleSubmit(createMetadata)}
    />
  );
};

export default MetadataCreateForm;
