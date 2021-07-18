import { Typography, TextField, InputAdornment } from '@material-ui/core';
import React from 'react';
import {
  InternalDescriptionFormData,
  DatasetFieldApiUpsertDatasetFieldInternalDescriptionRequest,
  InternalDescription,
} from 'generated-sources';
import { Controller, useForm } from 'react-hook-form';
import AppButton from 'components/shared/AppButton/AppButton';
import DialogWrapper from 'components/shared/DialogWrapper/DialogWrapper';
import CancelIcon from 'components/shared/Icons/CancelIcon';
import { StylesType } from './InternalDescriptionFormDialogStyles';

interface InternalDescriptionFormDialogProps extends StylesType {
  btnCreateEl: JSX.Element;
  isLoading: boolean;
  datasetFieldId: number;
  datasetFieldIdInternalDescription?: string;
  updateDataSetFieldDescription: (
    params: DatasetFieldApiUpsertDatasetFieldInternalDescriptionRequest
  ) => Promise<InternalDescription>;
}

const InternalDescriptionFormDialog: React.FC<InternalDescriptionFormDialogProps> = ({
  classes,
  btnCreateEl,
  isLoading,
  datasetFieldId,
  datasetFieldIdInternalDescription,
  updateDataSetFieldDescription,
}) => {
  const {
    handleSubmit,
    control,
    reset,
    setValue,
  } = useForm<InternalDescriptionFormData>({
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

  const onOpen = (handleOpen: () => void) => () => {
    if (btnCreateEl.props.onClick) btnCreateEl.props.onClick();
    handleOpen();
  };

  const onSubmit = (data: InternalDescriptionFormData) => {
    updateDataSetFieldDescription({
      datasetFieldId,
      internalDescriptionFormData: data,
    }).then(
      () => {
        setState({ ...initialState, isSuccessfulSubmit: true });
        clearState();
      },
      (response: Response) => {
        setState({
          ...initialState,
          error:
            response.statusText || 'Unable to add or edit description',
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
      {datasetFieldIdInternalDescription ? 'Edit ' : 'Add '}
      description
    </Typography>
  );

  const formContent = () => (
    <form
      id="datasetfield-internal-description"
      onSubmit={handleSubmit(onSubmit)}
      className={classes.form}
    >
      <Controller
        control={control}
        name="internalDescription"
        defaultValue={datasetFieldIdInternalDescription || ''}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            type="text"
            variant="outlined"
            label="Description"
            placeholder="Enter description"
            onKeyDown={handleKeyDown}
            InputProps={{
              endAdornment: field.value && (
                <InputAdornment position="start">
                  <AppButton
                    size="small"
                    color="unfilled"
                    icon={<CancelIcon />}
                    onClick={() => setValue('internalDescription', '')}
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
        form="datasetfield-internal-description"
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
        React.cloneElement(btnCreateEl, { onClick: onOpen(handleOpen) })
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

export default InternalDescriptionFormDialog;
