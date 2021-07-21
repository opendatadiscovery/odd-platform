import React from 'react';
import { Typography } from '@material-ui/core';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import {
  MetadataObject,
  MetadataField,
  MetadataFieldList,
  DataEntityApiCreateDataEntityMetadataFieldValueRequest,
  MetadataFieldValueList,
  MetadataApiGetMetadataFieldListRequest,
} from 'generated-sources';
import AppButton from 'components/shared/AppButton/AppButton';
import DialogWrapper from 'components/shared/DialogWrapper/DialogWrapper';
import MetadataCreateFormItemContainer from './MetadataCreateFormItem/MetadataCreateFormItemContainer';
import { StylesType } from './MetadataCreateFormStyles';

interface MetadataCreateFormProps extends StylesType {
  dataEntityId: number;
  metadataOptions: MetadataField[];
  isLoading: boolean;
  searchMetadata: (
    params: MetadataApiGetMetadataFieldListRequest
  ) => Promise<MetadataFieldList>;
  createDataEntityCustomMetadata: (
    params: DataEntityApiCreateDataEntityMetadataFieldValueRequest
  ) => Promise<MetadataFieldValueList>;
  btnCreateEl: JSX.Element;
}

const MetadataCreateForm: React.FC<MetadataCreateFormProps> = ({
  classes,
  dataEntityId,
  isLoading,
  createDataEntityCustomMetadata,
  btnCreateEl,
}) => {
  const methods = useForm<{ metadata: MetadataObject[] }>({
    mode: 'onChange',
    defaultValues: {
      metadata: [{}],
    },
  });
  const { fields, append, remove } = useFieldArray({
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
    createDataEntityCustomMetadata({
      dataEntityId,
      metadataObject: data.metadata,
    }).then(
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

  const handleAppend = React.useCallback(() => {
    append({});
  }, [append]);

  const handleRemove = (index: number) => () => {
    remove(index);
  };

  const formTitle = (
    <Typography variant="h4">Add Custom Metadata</Typography>
  );

  const formContent = () => (
    <>
      <FormProvider {...methods}>
        <form
          id="metadata-create-form"
          onSubmit={methods.handleSubmit(createMetadata)}
        >
          {fields.map((item, index) => (
            <MetadataCreateFormItemContainer
              key={item.id}
              itemIndex={index}
              onItemRemove={handleRemove(index)}
            />
          ))}
        </form>
      </FormProvider>
    </>
  );

  const formActionButtons = () => (
    <AppButton
      size="large"
      color="primary"
      form="metadata-create-form"
      type="submit"
      fullWidth
      disabled={!methods.formState.isValid}
      onClick={() => {}}
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
