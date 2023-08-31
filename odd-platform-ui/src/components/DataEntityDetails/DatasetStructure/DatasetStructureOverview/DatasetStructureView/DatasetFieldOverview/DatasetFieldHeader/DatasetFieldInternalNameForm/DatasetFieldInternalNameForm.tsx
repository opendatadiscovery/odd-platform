import React, { cloneElement, type ReactElement } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { useUpdateDatasetFieldInternalName } from 'lib/hooks';
import { getDatasetFieldInternalName } from 'redux/selectors';
import type { InternalNameFormData } from 'generated-sources';
import { Button, DialogWrapper, Input } from 'components/shared/elements';
import { updateDatasetFieldInternalName } from 'redux/slices/datasetStructure.slice';

type DatasetFieldInternalNameFormProps = {
  openBtnEl: ReactElement;
  datasetFieldId: number;
};

const DatasetFieldInternalNameForm = ({
  openBtnEl,
  datasetFieldId,
}: DatasetFieldInternalNameFormProps) => {
  const dispatch = useAppDispatch();
  const formId = 'datasetField-internal-name';
  const {
    mutateAsync: updateName,
    isLoading: isInternalNameUpdating,
    isSuccess: isInternalNameUpdated,
  } = useUpdateDatasetFieldInternalName();

  const dataSetFieldInternalName = useAppSelector(
    getDatasetFieldInternalName(datasetFieldId)
  );

  const { handleSubmit, control, reset } = useForm<InternalNameFormData>({
    mode: 'all',
    reValidateMode: 'onChange',
  });

  const clearState = () => {
    reset();
  };

  const onSubmit = async ({ internalName }: InternalNameFormData) => {
    await updateName({ datasetFieldId, internalNameFormData: { internalName } });
    dispatch(updateDatasetFieldInternalName({ fieldId: datasetFieldId, internalName }));
    clearState();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') handleSubmit(onSubmit);
  };

  const formTitle = (
    <Typography variant='h4' component='span'>
      {dataSetFieldInternalName ? 'Edit ' : 'Add '}
      business name
    </Typography>
  );

  const formContent = () => (
    <form id={formId} onSubmit={handleSubmit(onSubmit)}>
      <Controller
        control={control}
        name='internalName'
        defaultValue={dataSetFieldInternalName || ''}
        render={({ field }) => (
          <Input
            {...field}
            variant='main-m'
            label='Business name'
            placeholder='Enter business name'
            onKeyDown={handleKeyDown}
          />
        )}
      />
    </form>
  );

  const formActionButtons = () => (
    <Button text='Save' buttonType='main-lg' type='submit' form={formId} fullWidth />
  );

  return (
    <DialogWrapper
      renderOpenBtn={({ handleOpen }) => cloneElement(openBtnEl, { onClick: handleOpen })}
      title={formTitle}
      renderContent={formContent}
      renderActions={formActionButtons}
      handleCloseSubmittedForm={isInternalNameUpdated}
      isLoading={isInternalNameUpdating}
      clearState={clearState}
    />
  );
};

export default DatasetFieldInternalNameForm;
