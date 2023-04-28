import React from 'react';
import { FormControlLabel, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { type Ownership, type OwnershipFormData, Permission } from 'generated-sources';
import {
  Checkbox,
  Button,
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
  isDEG: boolean;
}

const OwnershipForm: React.FC<OwnershipFormProps> = ({
  dataEntityId,
  dataEntityOwnership,
  ownerEditBtn,
  isDEG,
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
    defaultValues: {
      ownerName: '',
      titleName: dataEntityOwnership?.title?.name || '',
      propagate: false,
    },
  });

  const resetState = React.useCallback(() => {
    methods.reset();
  }, []);

  const ownershipUpdate = ({ ownerName, titleName, propagate }: OwnershipFormData) => {
    const ownershipUpdateFormData = { titleName, propagate };
    const ownershipFormData = { ownerName, titleName, propagate };

    (dataEntityOwnership
      ? dispatch(
          updateDataEntityOwnership({
            dataEntityId,
            ownershipId: dataEntityOwnership.id,
            ownershipUpdateFormData,
          })
        )
      : dispatch(createDataEntityOwnership({ dataEntityId, ownershipFormData }))
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
      {isDEG && (
        <Controller
          name='propagate'
          control={methods.control}
          defaultValue={false}
          render={({ field }) => (
            <FormControlLabel
              {...field}
              sx={{ ml: -0.25, mt: 1 }}
              checked={field.value}
              control={<Checkbox sx={{ mr: 1 }} />}
              label='Propogate owner to the whole group'
            />
          )}
        />
      )}
    </form>
  );

  const ownerEditDialogActions = () => (
    <Button
      text={`${dataEntityOwnership?.id ? 'Edit' : 'Add'} owner`}
      buttonType='main-lg'
      type='submit'
      form='owner-add-form'
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
