import React from 'react';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { getDatasetFieldDescriptionUpdatingStatus } from 'redux/selectors';
import { Controller, useForm } from 'react-hook-form';
import { Typography } from '@mui/material';
import { WithPermissions } from 'components/shared/contexts';
import type {
  DataSetField,
  DatasetFieldDescriptionUpdateFormData,
} from 'generated-sources';
import { Permission } from 'generated-sources';
import { AppButton, AppInput, DialogWrapper } from 'components/shared';
import { ClearIcon } from 'components/shared/Icons';
import { updateDataSetFieldDescription } from 'redux/thunks';

interface DatasetFieldDescriptionFormProps {
  datasetFieldId: DataSetField['id'];
  description?: DataSetField['internalDescription'];
  btnCreateEl: JSX.Element;
}

const DatasetFieldDescriptionForm: React.FC<DatasetFieldDescriptionFormProps> = ({
  datasetFieldId,
  description,
  btnCreateEl,
}) => {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector(getDatasetFieldDescriptionUpdatingStatus);

  const methods = useForm<DatasetFieldDescriptionUpdateFormData>({
    defaultValues: { description },
  });

  const initialFormState = { error: '', isSuccessfulSubmit: false };
  const [{ error, isSuccessfulSubmit }, setFormState] = React.useState<{
    error: string;
    isSuccessfulSubmit: boolean;
  }>(initialFormState);

  const onOpen = (handleOpen: () => void) => () => {
    if (btnCreateEl.props.onClick) btnCreateEl.props.onClick();
    methods.reset({ description });
    handleOpen();
  };

  const clearFormState = () => {
    setFormState(initialFormState);
    methods.reset();
  };

  const handleFormSubmit = (
    datasetFieldDescriptionUpdateFormData: DatasetFieldDescriptionUpdateFormData
  ) => {
    dispatch(
      updateDataSetFieldDescription({
        datasetFieldId,
        datasetFieldDescriptionUpdateFormData,
      })
    ).then(
      () => {
        setFormState({ ...initialFormState, isSuccessfulSubmit: true });
        clearFormState();
      },
      (response: Response) => {
        setFormState({
          ...initialFormState,
          error: response.statusText || 'Unable to update description',
        });
      }
    );
  };

  const formTitle = (
    <Typography variant='h4' component='span'>
      Edit description
    </Typography>
  );

  const formContent = () => (
    <form
      id='dataset-field-description-form'
      onSubmit={methods.handleSubmit(handleFormSubmit)}
    >
      <Controller
        control={methods.control}
        name='description'
        defaultValue={description || ''}
        render={({ field }) => (
          // TODO change permission
          <WithPermissions
            permissionTo={Permission.DATASET_FIELD_INFO_UPDATE}
            renderContent={({ isAllowedTo: editDescription }) => (
              <AppInput
                {...field}
                label='Description'
                placeholder='Enter description'
                multiline
                maxRows={4}
                disabled={!editDescription}
                customEndAdornment={{
                  variant: 'clear',
                  showAdornment: !!field.value,
                  onCLick: () => methods.setValue('description', ''),
                  icon: <ClearIcon />,
                }}
              />
            )}
          />
        )}
      />
    </form>
  );

  const formActionButtons = () => (
    // TODO change permission
    <WithPermissions
      permissionTo={Permission.DATASET_FIELD_INFO_UPDATE}
      renderContent={({ isAllowedTo: editInfo }) => (
        <AppButton
          size='large'
          type='submit'
          form='dataset-field-description-form'
          color='primary'
          fullWidth
          disabled={!editInfo}
          isLoading={isLoading}
        >
          Save
        </AppButton>
      )}
    />
  );

  return (
    <DialogWrapper
      renderOpenBtn={({ handleOpen }) =>
        React.cloneElement(btnCreateEl, { onClick: onOpen(handleOpen) })
      }
      title={formTitle}
      renderContent={formContent}
      renderActions={formActionButtons}
      handleCloseSubmittedForm={isSuccessfulSubmit}
      errorText={error}
      formSubmitHandler={methods.handleSubmit(handleFormSubmit)}
    />
  );
};

export default DatasetFieldDescriptionForm;
