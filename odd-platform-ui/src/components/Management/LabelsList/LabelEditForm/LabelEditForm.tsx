import React from 'react';
import { Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import type { Label, LabelFormData } from 'generated-sources';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import {
  getLabelDeletingStatuses,
  getLabelUpdatingStatuses,
} from 'redux/selectors/labels.selectors';
import { updateLabel } from 'redux/thunks';
import { Button, AppInput, DialogWrapper } from 'components/shared/elements';

import ClearIcon from 'components/shared/icons/ClearIcon';

interface LabelEditFormProps {
  editBtn: JSX.Element;
  label: Label;
}

const LabelEditForm: React.FC<LabelEditFormProps> = ({ editBtn, label }) => {
  const dispatch = useAppDispatch();
  const { isLoading: isLabelDeleting, isLoaded: isLabelDeleted } = useAppSelector(
    getLabelDeletingStatuses
  );
  const { isLoading: isLabelUpdating, isLoaded: isLabelUpdated } = useAppSelector(
    getLabelUpdatingStatuses
  );
  const { control, handleSubmit, reset, formState } = useForm<LabelFormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const clearState = () => {
    reset();
  };

  const handleUpdate = (data: LabelFormData) => {
    dispatch(
      updateLabel({
        labelId: label.id,
        labelFormData: data,
      })
    ).then(() => {
      clearState();
    });
  };

  const formTitle = (
    <Typography variant='h4' component='span'>
      Edit Label
    </Typography>
  );

  const formContent = () => (
    <form id='label-edit-form' onSubmit={handleSubmit(handleUpdate)}>
      <Controller
        name='name'
        control={control}
        defaultValue={label.name}
        rules={{ required: true, validate: value => !!value.trim() }}
        render={({ field }) => (
          <AppInput
            {...field}
            placeholder='Label Name'
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
    <Button
      text='Save'
      type='submit'
      form='label-edit-form'
      buttonType='main-lg'
      fullWidth
      disabled={!formState.isValid}
    />
  );

  return (
    <DialogWrapper
      maxWidth='xs'
      renderOpenBtn={({ handleOpen }) =>
        React.cloneElement(editBtn, { onClick: handleOpen })
      }
      title={formTitle}
      renderContent={formContent}
      renderActions={formActionButtons}
      handleCloseSubmittedForm={isLabelDeleted || isLabelUpdated}
      isLoading={isLabelDeleting || isLabelUpdating}
    />
  );
};

export default LabelEditForm;
