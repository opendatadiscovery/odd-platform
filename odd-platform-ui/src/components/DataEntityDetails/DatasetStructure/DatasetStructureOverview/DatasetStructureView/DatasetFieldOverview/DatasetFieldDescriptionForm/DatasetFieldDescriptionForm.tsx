import React from 'react';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { getDatasetFieldDescriptionUpdatingStatus } from 'redux/selectors';
import { Controller, useForm } from 'react-hook-form';
import { Typography } from '@mui/material';
import type {
  DataSetField,
  DatasetFieldDescriptionUpdateFormData,
} from 'generated-sources';
import { Button, AppInput, DialogWrapper } from 'components/shared/elements';
import { ClearIcon } from 'components/shared/icons';
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
  const { isLoading, isLoaded } = useAppSelector(
    getDatasetFieldDescriptionUpdatingStatus
  );

  const methods = useForm<DatasetFieldDescriptionUpdateFormData>({
    defaultValues: { description },
  });

  const onOpen = (handleOpen: () => void) => () => {
    if (btnCreateEl.props.onClick) btnCreateEl.props.onClick();
    methods.reset({ description });
    handleOpen();
  };

  const clearFormState = () => {
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
    ).then(() => {
      clearFormState();
    });
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
          <AppInput
            {...field}
            label='Description'
            placeholder='Enter description'
            multiline
            maxRows={4}
            customEndAdornment={{
              variant: 'clear',
              showAdornment: !!field.value,
              onCLick: () => methods.setValue('description', ''),
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
      form='dataset-field-description-form'
      fullWidth
      isLoading={isLoading}
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
      handleCloseSubmittedForm={isLoaded}
      formSubmitHandler={methods.handleSubmit(handleFormSubmit)}
    />
  );
};

export default DatasetFieldDescriptionForm;
