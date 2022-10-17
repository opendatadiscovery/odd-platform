import React from 'react';
import { Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { Owner, OwnerFormData } from 'generated-sources';
import { DialogWrapper, AppInput, AppButton } from 'components/shared';
import { ClearIcon } from 'components/shared/Icons';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { createOwner, updateOwner } from 'redux/thunks';
import { getOwnerCreatingStatuses } from 'redux/selectors';

interface OwnerFormProps {
  btnCreateEl: JSX.Element;
  ownerId?: Owner['id'];
  name?: Owner['name'];
}

const OwnerForm: React.FC<OwnerFormProps> = ({ btnCreateEl, ownerId, name }) => {
  const dispatch = useAppDispatch();
  const { isLoading: isOwnerCreating } = useAppSelector(getOwnerCreatingStatuses);

  const { handleSubmit, control, reset, formState } = useForm<OwnerFormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: { name: name || '' },
  });

  const initialState = { error: '', isSuccessfulSubmit: false };
  const [{ error, isSuccessfulSubmit }, setState] = React.useState<{
    error: string;
    isSuccessfulSubmit: boolean;
  }>(initialState);

  const clearState = React.useCallback(() => {
    setState(initialState);
    reset({ name: name || '' });
  }, [name]);

  const handleOwnerFormSubmit = async (ownerFormData: OwnerFormData) => {
    (ownerId
      ? dispatch(updateOwner({ ownerId, ownerFormData }))
      : dispatch(createOwner({ ownerFormData }))
    ).then(
      () => {
        setState({ ...initialState, isSuccessfulSubmit: true });
        clearState();
      },
      (response: Response) => {
        setState({
          ...initialState,
          error:
            response.statusText || ownerId
              ? 'Unable to update owner'
              : 'Owner already exists',
        });
      }
    );
  };

  const formTitle = (
    <Typography variant='h4' component='span'>
      {ownerId ? 'Edit' : 'Add'} Owner
    </Typography>
  );

  const formContent = () => (
    <form id='owner-create-form' onSubmit={handleSubmit(handleOwnerFormSubmit)}>
      <Controller
        name='name'
        control={control}
        defaultValue={name || ''}
        rules={{ required: true, validate: value => !!value.trim() }}
        render={({ field }) => (
          <AppInput
            {...field}
            placeholder='Owner Name'
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
      size='large'
      type='submit'
      form='owner-create-form'
      color='primary'
      fullWidth
      disabled={!formState.isValid}
    >
      {ownerId ? 'Save' : 'Add new owner'}
    </AppButton>
  );

  return (
    <DialogWrapper
      maxWidth='xs'
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
      renderActions={formActionButtons}
      handleCloseSubmittedForm={isSuccessfulSubmit}
      isLoading={isOwnerCreating}
      errorText={error}
      clearState={clearState}
    />
  );
};

export default OwnerForm;
