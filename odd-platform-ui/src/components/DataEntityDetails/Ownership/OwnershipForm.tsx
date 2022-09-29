import React from 'react';
import { Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { Ownership, OwnershipFormData } from 'generated-sources';
import {
  AppButton,
  DialogWrapper,
  LabeledInfoItem,
} from 'components/shared';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import {
  createDataEntityOwnership,
  updateDataEntityOwnership,
} from 'redux/thunks';
import { getDataEntityOwnerUpdatingStatuses } from 'redux/selectors';
import OwnershipFormRoleAutocomplete from './OwnershipFormRoleAutocomplete/OwnershipFormRoleAutocomplete';
import OwnershipFormOwnerAutocomplete from './OwnershipFormOwnerAutocomplete/OwnershipFormOwnerAutocomplete';

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

  const { isLoading: isOwnershipUpdating } = useAppSelector(
    getDataEntityOwnerUpdatingStatuses
  );

  const methods = useForm<OwnershipFormData>({
    mode: 'onChange',
    defaultValues: {
      ownerName: '',
      roleName: dataEntityOwnership?.role?.name || '',
    },
  });
  const initialFormState = { error: '', isSuccessfulSubmit: false };
  const [{ error, isSuccessfulSubmit }, setFormState] = React.useState<{
    error: string;
    isSuccessfulSubmit: boolean;
  }>(initialFormState);

  const resetState = React.useCallback(() => {
    setFormState(initialFormState);
    methods.reset();
  }, [setFormState]);

  const ownershipUpdate = (data: OwnershipFormData) => {
    (dataEntityOwnership
      ? dispatch(
          updateDataEntityOwnership({
            dataEntityId,
            ownershipId: dataEntityOwnership.id,
            ownershipUpdateFormData: { roleName: data.roleName },
          })
        )
      : dispatch(
          createDataEntityOwnership({
            dataEntityId,
            ownershipFormData: data,
          })
        )
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
    <Typography variant="h4" component="span">
      {dataEntityOwnership ? 'Edit' : 'Add'} owner
    </Typography>
  );

  const formContent = () => (
    <form
      id="owner-add-form"
      onSubmit={methods.handleSubmit(ownershipUpdate)}
    >
      {dataEntityOwnership ? (
        <LabeledInfoItem inline label="Owner:" labelWidth={2}>
          {dataEntityOwnership.owner.name}
        </LabeledInfoItem>
      ) : (
        <Controller
          name="ownerName"
          control={methods.control}
          defaultValue=""
          rules={{ required: true }}
          render={({ field }) => (
            <OwnershipFormOwnerAutocomplete field={field} />
          )}
        />
      )}
      <Controller
        name="roleName"
        control={methods.control}
        defaultValue={dataEntityOwnership?.role?.name || ''}
        rules={{ required: true, validate: value => !!value?.trim() }}
        render={({ field }) => (
          <OwnershipFormRoleAutocomplete field={field} />
        )}
      />
    </form>
  );

  const ownerEditDialogActions = () => (
    <AppButton
      size="large"
      color="primary"
      type="submit"
      form="owner-add-form"
      fullWidth
      disabled={!methods.formState.isValid}
    >
      {dataEntityOwnership ? 'Edit' : 'Add'} owner
    </AppButton>
  );

  return (
    <DialogWrapper
      maxWidth="xs"
      renderOpenBtn={({ handleOpen }) =>
        React.cloneElement(ownerEditBtn, { onClick: handleOpen })
      }
      title={formTitle}
      renderContent={formContent}
      renderActions={ownerEditDialogActions}
      handleCloseSubmittedForm={isSuccessfulSubmit}
      isLoading={isOwnershipUpdating}
      errorText={error}
      clearState={resetState}
      formSubmitHandler={methods.handleSubmit(ownershipUpdate)}
    />
  );
};

export default OwnershipForm;
