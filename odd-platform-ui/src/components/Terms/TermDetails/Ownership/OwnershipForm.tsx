import React from 'react';
import { Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { type Ownership, type OwnershipFormData, Permission } from 'generated-sources';
import {
  AppButton,
  DialogWrapper,
  LabeledInfoItem,
  OwnerAutocomplete,
  OwnerTitleAutocomplete,
} from 'components/shared';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { useAppParams } from 'lib/hooks';
import { createTermOwnership, updateTermOwnership } from 'redux/thunks';
import { getTermDetailsOwnerUpdatingStatuses } from 'redux/selectors';
import { WithPermissions } from 'components/shared/contexts';

interface OwnershipFormProps {
  termDetailsOwnership?: Ownership;
  ownerEditBtn: JSX.Element;
}

const OwnershipForm: React.FC<OwnershipFormProps> = ({
  termDetailsOwnership,
  ownerEditBtn,
}) => {
  const dispatch = useAppDispatch();
  const { termId } = useAppParams();

  const { isLoading: isOwnerUpdating } = useAppSelector(
    getTermDetailsOwnerUpdatingStatuses
  );

  const methods = useForm<OwnershipFormData>({
    mode: 'onChange',
    defaultValues: { ownerName: '', titleName: termDetailsOwnership?.title?.name || '' },
  });
  const initialFormState = { error: '', isSuccessfulSubmit: false };
  const [{ error, isSuccessfulSubmit }, setFormState] = React.useState(initialFormState);

  const resetState = React.useCallback(() => {
    setFormState(initialFormState);
    methods.reset();
  }, [setFormState]);

  const ownershipUpdate = (data: OwnershipFormData) => {
    (termDetailsOwnership
      ? dispatch(
          updateTermOwnership({
            termId,
            ownershipId: termDetailsOwnership.id,
            ownershipUpdateFormData: { titleName: data.titleName },
          })
        )
      : dispatch(createTermOwnership({ termId, ownershipFormData: data }))
    ).then(
      () => {
        setFormState({ ...initialFormState, isSuccessfulSubmit: true });
        resetState();
      },
      (response: Response) => {
        setFormState({
          ...initialFormState,
          error: response.statusText || 'Unable to update owner',
        });
      }
    );
  };

  const formTitle = (
    <Typography variant='h4' component='span'>
      {termDetailsOwnership ? 'Edit' : 'Add'} owner
    </Typography>
  );

  const formContent = () => (
    <form id='term-owner-add-form' onSubmit={methods.handleSubmit(ownershipUpdate)}>
      {termDetailsOwnership ? (
        <LabeledInfoItem inline label='Owner:' labelWidth={1.7}>
          {termDetailsOwnership.owner.name}
        </LabeledInfoItem>
      ) : (
        <Controller
          name='ownerName'
          control={methods.control}
          defaultValue=''
          rules={{ required: true }}
          render={({ field }) => (
            <WithPermissions
              permissionTo={Permission.OWNER_CREATE}
              renderContent={({ isAllowedTo: createOwner }) => (
                <OwnerAutocomplete field={field} disableOwnerCreating={!createOwner} />
              )}
            />
          )}
        />
      )}
      <Controller
        name='titleName'
        control={methods.control}
        defaultValue={termDetailsOwnership?.title?.name || ''}
        rules={{ required: true, validate: value => !!value?.trim() }}
        render={({ field }) => <OwnerTitleAutocomplete field={field} />}
      />
    </form>
  );

  const ownerEditDialogActions = () => (
    <AppButton
      size='large'
      color='primary'
      type='submit'
      form='term-owner-add-form'
      fullWidth
      disabled={!methods.formState.isValid}
    >
      {termDetailsOwnership ? 'Edit' : 'Add'} owner
    </AppButton>
  );

  return (
    <DialogWrapper
      maxWidth='xs'
      renderOpenBtn={({ handleOpen }) =>
        React.cloneElement(ownerEditBtn, { onClick: handleOpen })
      }
      title={formTitle}
      renderContent={formContent}
      renderActions={ownerEditDialogActions}
      handleCloseSubmittedForm={isSuccessfulSubmit}
      isLoading={isOwnerUpdating}
      errorText={error}
      clearState={resetState}
      formSubmitHandler={methods.handleSubmit(ownershipUpdate)}
    />
  );
};

export default OwnershipForm;
