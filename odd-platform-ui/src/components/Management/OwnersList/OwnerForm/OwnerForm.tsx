import React from 'react';
import { Typography, TextField, InputAdornment } from '@material-ui/core';
import { useForm, Controller } from 'react-hook-form';
import {
  OwnerFormData,
  Owner,
  OwnerApiCreateOwnerRequest,
  OwnerApiUpdateOwnerRequest,
} from 'generated-sources';
import AppButton from 'components/shared/AppButton/AppButton';
import DialogWrapper from 'components/shared/DialogWrapper/DialogWrapper';
import CancelIcon from 'components/shared/Icons/CancelIcon';
import { StylesType } from './OwnerFormStyles';

interface OwnerFormProps extends StylesType {
  btnCreateEl: JSX.Element;
  owner?: Owner;
  isLoading: boolean;
  createOwner: (params: OwnerApiCreateOwnerRequest) => Promise<Owner>;
  updateOwner: (params: OwnerApiUpdateOwnerRequest) => Promise<Owner>;
}

const OwnerForm: React.FC<OwnerFormProps> = ({
  classes,
  btnCreateEl,
  owner,
  isLoading,
  createOwner,
  updateOwner,
}) => {
  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState,
  } = useForm<OwnerFormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      name: owner?.name || '',
    },
  });

  const initialState = { error: '', isSuccessfulSubmit: false };
  const [{ error, isSuccessfulSubmit }, setState] = React.useState<{
    error: string;
    isSuccessfulSubmit: boolean;
  }>(initialState);

  const clearState = React.useCallback(() => {
    setState(initialState);
    reset({ name: owner?.name || '' });
  }, [owner]);

  const handleSudmit = async (data: OwnerFormData) => {
    (owner
      ? updateOwner({ ownerId: owner.id, ownerFormData: data })
      : createOwner({ ownerFormData: data })
    ).then(
      () => {
        setState({ ...initialState, isSuccessfulSubmit: true });
        clearState();
      },
      (response: Response) => {
        setState({
          ...initialState,
          error:
            response.statusText || owner
              ? 'Unable to update owner'
              : 'Owner already exists',
        });
      }
    );
  };

  const formTitle = (
    <Typography variant="h4">{owner ? 'Edit' : 'Add'} Owner</Typography>
  );

  const formContent = () => (
    <form id="owner-create-form" onSubmit={handleSubmit(handleSudmit)}>
      <Controller
        name="name"
        control={control}
        defaultValue={owner?.name || ''}
        rules={{ required: true, validate: value => !!value.trim() }}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            placeholder="Owner Name"
            variant="outlined"
            InputProps={{
              endAdornment: field.value && (
                <InputAdornment position="start">
                  <AppButton
                    size="small"
                    color="unfilled"
                    icon={<CancelIcon />}
                    onClick={() => setValue('name', '')}
                  />
                </InputAdornment>
              ),
            }}
          />
        )}
      />
    </form>
  );

  const formActionButtons = (handleClose: () => void) => (
    <AppButton
      size="large"
      type="submit"
      form="owner-create-form"
      color="primary"
      fullWidth
      disabled={!formState.isValid}
    >
      {owner ? 'Save' : 'Add new owner'}
    </AppButton>
  );

  return (
    <DialogWrapper
      maxWidth="xs"
      renderOpenBtn={({ handleOpen }) =>
        React.cloneElement(btnCreateEl, {
          onClick: () => {
            clearState();
            handleOpen();
          },
        })
      }
      title={formTitle}
      renderContent={formContent}
      renderActions={({ handleClose }) => formActionButtons(handleClose)}
      handleCloseSubmittedForm={isSuccessfulSubmit}
      isLoading={isLoading}
      errorText={error}
      clearState={clearState}
    />
  );
};

export default OwnerForm;
