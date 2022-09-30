import React from 'react';
import { Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { Label, LabelFormData } from 'generated-sources';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import {
  getLabelDeletingStatuses,
  getLabelUpdatingStatuses,
} from 'redux/selectors/labels.selectors';
import { updateLabel } from 'redux/thunks';
import DialogWrapper from 'components/shared/DialogWrapper/DialogWrapper';
import AppButton from 'components/shared/AppButton/AppButton';
import AppInput from 'components/shared/AppInput/AppInput';

import ClearIcon from 'components/shared/Icons/ClearIcon';

interface LabelEditFormProps {
  editBtn: JSX.Element;
  label: Label;
}

const LabelEditForm: React.FC<LabelEditFormProps> = ({
  editBtn,
  label,
}) => {
  const dispatch = useAppDispatch();
  const { isLoading: isLabelDeleting } = useAppSelector(
    getLabelDeletingStatuses
  );
  const { isLoading: isLabelUpdating } = useAppSelector(
    getLabelUpdatingStatuses
  );
  const { control, handleSubmit, reset, formState } =
    useForm<LabelFormData>({
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
    dispatch(
      updateLabel({
        labelId: label.id,
        labelFormData: data,
      })
    ).then(
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

  const formTitle = (
    <Typography variant="h4" component="span">
      Edit Label
    </Typography>
  );

  const formContent = () => (
    <form id="label-edit-form" onSubmit={handleSubmit(handleUpdate)}>
      <Controller
        name="name"
        control={control}
        defaultValue={label.name}
        rules={{ required: true, validate: value => !!value.trim() }}
        render={({ field }) => (
          <AppInput
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
      isLoading={isLabelDeleting || isLabelUpdating}
      errorText={error}
    />
  );
};

export default LabelEditForm;
