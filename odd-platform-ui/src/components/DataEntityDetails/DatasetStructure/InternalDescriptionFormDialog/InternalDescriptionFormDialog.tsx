import { Typography } from '@mui/material';
import React from 'react';
import {
  // DatasetFieldApiUpsertDatasetFieldInternalDescriptionRequest,
  InternalDescription,
  InternalDescriptionFormData,
} from 'generated-sources';
import { Controller, useForm } from 'react-hook-form';
import DialogWrapper from 'components/shared/DialogWrapper/DialogWrapper';
import AppButton from 'components/shared/AppButton/AppButton';
import AppTextField from 'components/shared/AppTextField/AppTextField';
import ClearIcon from 'components/shared/Icons/ClearIcon';
import { StylesType } from './InternalDescriptionFormDialogStyles';

interface InternalDescriptionFormDialogProps extends StylesType {
  btnCreateEl: JSX.Element;
  isLoading: boolean;
  datasetFieldId: number;
  datasetFieldIdInternalDescription?: string;
  // updateDataSetFieldDescription: (
  //   params: DatasetFieldApiUpsertDatasetFieldInternalDescriptionRequest
  // ) => Promise<InternalDescription>;
}

const InternalDescriptionFormDialog: React.FC<InternalDescriptionFormDialogProps> = ({
  classes,
  btnCreateEl,
  isLoading,
  datasetFieldId,
  datasetFieldIdInternalDescription,
  // updateDataSetFieldDescription,
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
    // updateDataSetFieldDescription({
    //   datasetFieldId,
    //   internalDescriptionFormData: data,
    // }).then(
    //   () => {
    //     setState({ ...initialState, isSuccessfulSubmit: true });
    //     clearState();
    //   },
    //   (response: Response) => {
    //     setState({
    //       ...initialState,
    //       error:
    //         response.statusText || 'Unable to add or edit description',
    //     });
    //   }
    // );
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
          <AppTextField
            {...field}
            label="Description"
            placeholder="Enter description"
            onKeyDown={handleKeyDown}
            customEndAdornment={{
              variant: 'clear',
              showAdornment: !!field.value,
              onCLick: () => setValue('internalDescription', ''),
              icon: <ClearIcon />,
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
