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
} from 'components/shared/elements';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { createDataEntityOwnership, updateDataEntityOwnership } from 'redux/thunks';
import {
  getDataEntityOwnerCreatingStatuses,
  getDataEntityOwnerUpdatingStatuses,
} from 'redux/selectors';
import { WithPermissions } from 'components/shared/contexts';

interface OwnershipFormProps {
  dataEntityId: number;
  dataEntityOwnership?: Ownership;
  ownerEditBtn: JSX.Element;
}

const OwnershipForm: React.FC<OwnershipFormProps> = ({
  dataEntityId,
  dataEntityOwnership,
  ownerEditBtn,
}) => {
  const dispatch = useAppDispatch();

  const { isLoading: isOwnershipCreating, isLoaded: isOwnershipCreated } = useAppSelector(
    getDataEntityOwnerCreatingStatuses
  );
  const { isLoading: isOwnershipUpdating, isLoaded: isOwnershipUpdated } = useAppSelector(
    getDataEntityOwnerUpdatingStatuses
  );

  const methods = useForm<OwnershipFormData>({
    mode: 'onChange',
    defaultValues: { ownerName: '', titleName: dataEntityOwnership?.title?.name || '' },
  });

  const resetState = React.useCallback(() => {
    methods.reset();
  }, []);

  const ownershipUpdate = (data: OwnershipFormData) => {
    (dataEntityOwnership
      ? dispatch(
          updateDataEntityOwnership({
            dataEntityId,
            ownershipId: dataEntityOwnership.id,
            ownershipUpdateFormData: { titleName: data.titleName },
          })
        )
      : dispatch(createDataEntityOwnership({ dataEntityId, ownershipFormData: data }))
    ).then(() => {
      resetState();
    });
  };

  const formTitle = (
    <Typography variant='h4' component='span'>
      {dataEntityOwnership ? 'Edit' : 'Add'} owner
    </Typography>
  );

  const formContent = () => (
    <form id='owner-add-form' onSubmit={methods.handleSubmit(ownershipUpdate)}>
      {dataEntityOwnership ? (
        <LabeledInfoItem inline label='Owner:' labelWidth={1.7}>
          {dataEntityOwnership.owner.name}
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
        defaultValue={dataEntityOwnership?.title?.name || ''}
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
      form='owner-add-form'
      fullWidth
      disabled={!methods.formState.isValid}
    >
      {dataEntityOwnership ? 'Edit' : 'Add'} owner
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
      handleCloseSubmittedForm={
        dataEntityOwnership ? isOwnershipUpdated : isOwnershipCreated
      }
      isLoading={dataEntityOwnership ? isOwnershipUpdating : isOwnershipCreating}
      clearState={resetState}
      formSubmitHandler={methods.handleSubmit(ownershipUpdate)}
    />
  );
};

export default OwnershipForm;
