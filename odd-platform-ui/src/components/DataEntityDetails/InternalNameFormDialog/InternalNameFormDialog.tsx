import { Typography, TextField, InputAdornment } from '@material-ui/core';
import React from 'react';
import {
  InternalNameFormData,
  DataEntityApiUpsertDataEntityInternalNameRequest,
  InternalName,
} from 'generated-sources';
import { Controller, useForm } from 'react-hook-form';
import AppButton from 'components/shared/AppButton/AppButton';
import DialogWrapper from 'components/shared/DialogWrapper/DialogWrapper';
import CancelIcon from 'components/shared/Icons/CancelIcon';
import { StylesType } from './InternalNameFormDialogStyles';

interface InternalNameFormDialogProps extends StylesType {
  btnCreateEl: JSX.Element;
  isLoading: boolean;
  dataEntityId: number;
  dataEntityInternalName?: string;
  updateDataEntityInternalName: (
    params: DataEntityApiUpsertDataEntityInternalNameRequest
  ) => Promise<InternalName>;
}

const InternalNameFormDialog: React.FC<InternalNameFormDialogProps> = ({
  classes,
  btnCreateEl,
  isLoading,
  dataEntityId,
  dataEntityInternalName,
  updateDataEntityInternalName,
}) => {
  const {
    handleSubmit,
    control,
    reset,
    setValue,
  } = useForm<InternalNameFormData>({
    mode: 'all',
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

  const onSubmit = (data: InternalNameFormData) => {
    updateDataEntityInternalName({
      dataEntityId,
      internalNameFormData: data,
    }).then(
      () => {
        setState({ ...initialState, isSuccessfulSubmit: true });
        clearState();
      },
      (response: Response) => {
        setState({
          ...initialState,
          error:
            response.statusText || 'Unable to add or edit internal name',
        });
      }
    );
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSubmit(onSubmit);
    }
  };

  const formTitle = (
    <Typography variant="h4">
      {dataEntityInternalName ? 'Edit ' : 'Add '}
      business name
    </Typography>
  );

  const formContent = () => (
    <form
      id="dataentity-internal-name"
      onSubmit={handleSubmit(onSubmit)}
      className={classes.form}
    >
      <Controller
        control={control}
        name="internalName"
        defaultValue={dataEntityInternalName || ''}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            type="text"
            variant="outlined"
            label="Name"
            placeholder="Enter business name"
            onKeyDown={handleKeyDown}
            InputProps={{
              endAdornment: field.value && (
                <InputAdornment position="start">
                  <AppButton
                    size="small"
                    color="unfilled"
                    icon={<CancelIcon />}
                    onClick={() => setValue('internalName', '')}
                  />
                </InputAdornment>
              ),
            }}
          />
        )}
      />
    </form>
  );

  const formActionButtons = () => (
    <>
      <AppButton
        size="large"
        type="submit"
        form="dataentity-internal-name"
        color="primary"
        fullWidth
        onClick={() => {}}
      >
        Save
      </AppButton>
    </>
  );

  return (
    <DialogWrapper
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

export default InternalNameFormDialog;
