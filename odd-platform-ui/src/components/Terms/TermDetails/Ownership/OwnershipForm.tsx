import React from 'react';
import { Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { type Ownership, type OwnershipFormData, Permission } from 'generated-sources';
import {
  Button,
  DialogWrapper,
  LabeledInfoItem,
  OwnerAutocomplete,
  OwnerTitleAutocomplete,
} from 'components/shared/elements';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { useAppParams } from 'lib/hooks';
import { createTermOwnership, updateTermOwnership } from 'redux/thunks';
import {
  getTermDetailsOwnerCreatingStatuses,
  getTermDetailsOwnerUpdatingStatuses,
} from 'redux/selectors';
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

  const { isLoading: isOwnerUpdating, isLoaded: isOwnerUpdated } = useAppSelector(
    getTermDetailsOwnerUpdatingStatuses
  );
  const { isLoading: isOwnerCreating, isLoaded: isOwnerCreated } = useAppSelector(
    getTermDetailsOwnerCreatingStatuses
  );

  const methods = useForm<OwnershipFormData>({
    mode: 'onChange',
    defaultValues: { ownerName: '', titleName: termDetailsOwnership?.title?.name || '' },
  });

  const resetState = React.useCallback(() => {
    methods.reset();
  }, []);

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
    ).then(() => {
      resetState();
    });
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
    <Button
      text={termDetailsOwnership ? 'Edit owner' : 'Add owner'}
      buttonType='main-lg'
      type='submit'
      form='term-owner-add-form'
      fullWidth
      disabled={!methods.formState.isValid}
    />
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
      handleCloseSubmittedForm={termDetailsOwnership ? isOwnerUpdated : isOwnerCreated}
      isLoading={termDetailsOwnership ? isOwnerUpdating : isOwnerCreating}
      clearState={resetState}
      formSubmitHandler={methods.handleSubmit(ownershipUpdate)}
    />
  );
};

export default OwnershipForm;
