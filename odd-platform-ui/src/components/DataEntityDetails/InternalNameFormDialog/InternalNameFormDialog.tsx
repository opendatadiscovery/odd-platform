import { Typography } from '@mui/material';
import React from 'react';
import { type InternalNameFormData } from 'generated-sources';
import { Controller, useForm } from 'react-hook-form';
import { Button, AppInput, DialogWrapper } from 'components/shared/elements';
import { ClearIcon } from 'components/shared/icons';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { updateDataEntityInternalName } from 'redux/thunks';
import { useAppParams } from 'lib/hooks';
import {
  getDataEntityInternalName,
  getDataEntityInternalNameUpdatingStatuses,
} from 'redux/selectors';

interface InternalNameFormDialogProps {
  btnCreateEl: JSX.Element;
}

const InternalNameFormDialog: React.FC<InternalNameFormDialogProps> = ({
  btnCreateEl,
}) => {
  const dispatch = useAppDispatch();
  const { dataEntityId } = useAppParams();

  const dataEntityInternalName = useAppSelector(getDataEntityInternalName(dataEntityId));
  const { isLoading: isInternalNameUpdating, isLoaded: isInternalNameUpdated } =
    useAppSelector(getDataEntityInternalNameUpdatingStatuses);

  const { handleSubmit, control, reset } = useForm<InternalNameFormData>({
    mode: 'all',
    reValidateMode: 'onChange',
  });

  const clearState = () => {
    reset();
  };

  const onSubmit = (data: InternalNameFormData) => {
    dispatch(
      updateDataEntityInternalName({ dataEntityId, internalNameFormData: data })
    ).then(() => {
      clearState();
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') handleSubmit(onSubmit);
  };

  const formTitle = (
    <Typography variant='h4' component='span'>
      {dataEntityInternalName ? 'Edit ' : 'Add '}
      business name
    </Typography>
  );

  const formContent = () => (
    <form id='dataentity-internal-name' onSubmit={handleSubmit(onSubmit)}>
      <Controller
        control={control}
        name='internalName'
        defaultValue={dataEntityInternalName || ''}
        render={({ field }) => (
          <AppInput
            {...field}
            label='Business name'
            placeholder='Enter business name'
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
    <Button
      text='Save'
      buttonType='main-lg'
      type='submit'
      form='dataentity-internal-name'
      fullWidth
    />
  );

  return (
    <DialogWrapper
      renderOpenBtn={({ handleOpen }) =>
        React.cloneElement(btnCreateEl, { onClick: handleOpen })
      }
      title={formTitle}
      renderContent={formContent}
      renderActions={formActionButtons}
      handleCloseSubmittedForm={isInternalNameUpdated}
      isLoading={isInternalNameUpdating}
      clearState={clearState}
    />
  );
};

export default InternalNameFormDialog;
