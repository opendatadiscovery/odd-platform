import React from 'react';
import { Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import {
  Label,
  LabelFormData,
  LabelApiUpdateLabelRequest,
} from 'generated-sources';
import DialogWrapper from 'components/shared/DialogWrapper/DialogWrapper';
import AppButton from 'components/shared/AppButton/AppButton';
import AppTextField from 'components/shared/AppTextField/AppTextField';
import ClearIcon from 'components/shared/Icons/ClearIcon';
import { StylesType } from './LabelEditFormStyles';

interface LabelEditFormProps extends StylesType {
  editBtn: JSX.Element;
  label: Label;
  isLoading: boolean;
  updateLabel: (params: LabelApiUpdateLabelRequest) => Promise<Label>;
}

const LabelEditForm: React.FC<LabelEditFormProps> = ({
  classes,
  editBtn,
  label,
  isLoading,
  updateLabel,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState,
  } = useForm<LabelFormData>({
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

  const handleUpdate = (data: LabelFormData) => {
    updateLabel({
      labelId: label.id,
      labelFormData: data,
    }).then(
      () => {
        setState({ ...initialState, isSuccessfulSubmit: true });
        clearState();
      },
      (response: Response) => {
        setState({
          ...initialState,
          error: response.statusText || 'Label already exists',
        });
      }
    );
  };

  const formTitle = <Typography variant="h4">Edit Label</Typography>;

  const formContent = () => (
    <form id="label-edit-form" onSubmit={handleSubmit(handleUpdate)}>
      <Controller
        name="name"
        control={control}
        defaultValue={label.name}
        rules={{ required: true, validate: value => !!value.trim() }}
        render={({ field }) => (
          <AppTextField
            {...field}
            placeholder="Label Name"
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
      form="label-edit-form"
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
        React.cloneElement(editBtn, { onClick: handleOpen })
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

export default LabelEditForm;
