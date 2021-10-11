import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Namespace,
  NamespaceFormData,
  NamespaceApiUpdateNamespaceRequest,
  NamespaceApiCreateNamespaceRequest,
} from 'generated-sources';
import DialogWrapper from 'components/shared/DialogWrapper/DialogWrapper';
import { Typography } from '@mui/material';
import AppButton from 'components/shared/AppButton/AppButton';
import AppTextField from 'components/shared/AppTextField/AppTextField';
import { StylesType } from './NamespaceFormStyles';

interface NamespaceFormProps extends StylesType {
  btnEl: JSX.Element;
  namespace?: Namespace;
  isLoading: boolean;
  createNamespace: (
    params: NamespaceApiCreateNamespaceRequest
  ) => Promise<Namespace>;
  updateNamespace: (
    params: NamespaceApiUpdateNamespaceRequest
  ) => Promise<Namespace>;
}

const NamespaceForm: React.FC<NamespaceFormProps> = ({
  classes,
  btnEl,
  namespace,
  isLoading,
  createNamespace,
  updateNamespace,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState,
  } = useForm<NamespaceFormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const initialState = { error: '', isSuccessfulSubmit: false };
  const [{ error, isSuccessfulSubmit }, setState] = React.useState<{
    error: string;
    isSuccessfulSubmit: boolean;
  }>(initialState);

  const clearState = () => {
    setState(initialState);
    reset();
  };

  const handleUpdate = (data: NamespaceFormData) => {
    (namespace
      ? updateNamespace({
          namespaceId: namespace.id,
          namespaceUpdateFormData: data,
        })
      : createNamespace({
          namespaceFormData: data,
        })
    ).then(
      () => {
        setState({ ...initialState, isSuccessfulSubmit: true });
        clearState();
      },
      (response: Response) => {
        setState({
          ...initialState,
          error: response.statusText || 'Namespace already exists',
        });
      }
    );
  };

  const formTitle = (
    <Typography variant="h4">
      {namespace ? 'Edit' : 'Add'} Namespace
    </Typography>
  );

  const formContent = () => (
    <form id="namespace-edit-form" onSubmit={handleSubmit(handleUpdate)}>
      <Controller
        name="name"
        control={control}
        defaultValue={namespace?.name || ''}
        rules={{ required: true, validate: value => !!value.trim() }}
        render={({ field }) => (
          <AppTextField
            {...field}
            fullWidth
            size="medium"
            placeholder="Namespace Name"
            defaultEndAdornmentCondition={!!field.value}
            defaultEndAdornmentOnClick={() => field.onChange('')}
          />
        )}
      />
    </form>
  );

  const formActionButtons = () => (
    <AppButton
      size="large"
      type="submit"
      form="namespace-edit-form"
      color="primary"
      fullWidth
      disabled={!formState.isValid}
    >
      Save
    </AppButton>
  );

  return (
    <DialogWrapper
      maxWidth="xs"
      renderOpenBtn={({ handleOpen }) =>
        React.cloneElement(btnEl, { onClick: handleOpen })
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

export default NamespaceForm;
