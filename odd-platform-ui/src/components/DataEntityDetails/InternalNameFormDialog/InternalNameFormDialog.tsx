import { Typography } from '@mui/material';
import React from 'react';
import { InternalNameFormData } from 'generated-sources';
import { Controller, useForm } from 'react-hook-form';
import DialogWrapper from 'components/shared/DialogWrapper/DialogWrapper';
import AppButton from 'components/shared/AppButton/AppButton';
import AppInput from 'components/shared/AppInput/AppInput';
import ClearIcon from 'components/shared/Icons/ClearIcon';
import { useAppDispatch } from 'lib/redux/hooks';
import { updateDataEntityInternalName } from 'redux/thunks';

interface InternalNameFormDialogProps {
  btnCreateEl: JSX.Element;
  isLoading: boolean;
  dataEntityId: number;
  dataEntityInternalName?: string;
}

const InternalNameFormDialog: React.FC<InternalNameFormDialogProps> = ({
  btnCreateEl,
  isLoading,
  dataEntityId,
  dataEntityInternalName,
}) => {
  const dispatch = useAppDispatch();

  const { handleSubmit, control, reset } = useForm<InternalNameFormData>({
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
    dispatch(
      updateDataEntityInternalName({
        dataEntityId,
        internalNameFormData: data,
      })
    ).then(
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
    <Typography variant="h4" component="span">
      {dataEntityInternalName ? 'Edit ' : 'Add '}
      business name
    </Typography>
  );

  const formContent = () => (
    <form id="dataentity-internal-name" onSubmit={handleSubmit(onSubmit)}>
      <Controller
        control={control}
        name="internalName"
        defaultValue={dataEntityInternalName || ''}
        render={({ field }) => (
          <AppInput
            {...field}
            label="Business name"
            placeholder="Enter business name"
            onKeyDown={handleKeyDown}
            customEndAdornment={{
              variant: 'clear',
              showAdornment: !!field.value,
              onCLick: () => field.onChange(''),
              icon: <ClearIcon />,
            }}
          />
        )}
      />
    </form>
  );

  const formActionButtons = () => (
    <AppButton
      size="large"
      type="submit"
      form="dataentity-internal-name"
      color="primary"
      fullWidth
    >
      Save
    </AppButton>
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
      clearState={clearState}
    />
  );
};

export default InternalNameFormDialog;
