import React from 'react';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { getDatasetFieldLabelsUpdatingStatus } from 'redux/selectors';
import { useFieldArray, useForm } from 'react-hook-form';
import { Grid, Typography } from '@mui/material';
import type { DataSetField, Label } from 'generated-sources';
import { Button, DialogWrapper, LabelItem } from 'components/shared/elements';
import { updateDataSetFieldLabels } from 'redux/thunks';
import LabelsAutocomplete from './LabelsAutocomplete/LabelsAutocomplete';

interface DatasetFieldLabelsFormProps {
  datasetFieldId: DataSetField['id'];
  labels: DataSetField['labels'];
  btnCreateEl: JSX.Element;
}

type DatasetFieldLabelsFormData = {
  labels: Omit<Label, 'id'>[];
};

const DatasetFieldLabelsForm: React.FC<DatasetFieldLabelsFormProps> = ({
  datasetFieldId,
  labels,
  btnCreateEl,
}) => {
  const dispatch = useAppDispatch();
  const { isLoading, isLoaded } = useAppSelector(getDatasetFieldLabelsUpdatingStatus);

  const methods = useForm<DatasetFieldLabelsFormData>({
    defaultValues: { labels: labels?.map(({ name, external }) => ({ name, external })) },
  });

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: 'labels',
  });

  const onOpen = (handleOpen: () => void) => () => {
    if (btnCreateEl.props.onClick) btnCreateEl.props.onClick();
    methods.reset({ labels: labels?.map(({ name, external }) => ({ name, external })) });
    handleOpen();
  };

  const clearFormState = () => {
    methods.reset();
  };

  const handleFormSubmit = (data: DatasetFieldLabelsFormData) => {
    dispatch(
      updateDataSetFieldLabels({
        datasetFieldId,
        datasetFieldLabelsUpdateFormData: {
          labels: data.labels.map(label => label.name),
        },
      })
    ).then(() => {
      clearFormState();
    });
  };

  const formTitle = (
    <Typography variant='h4' component='span'>
      {labels && labels?.length > 0 ? 'Edit' : 'Add'} labels
    </Typography>
  );

  const formContent = () => (
    <form
      id='dataset-field-labels-form'
      onSubmit={methods.handleSubmit(handleFormSubmit)}
    >
      <LabelsAutocomplete appendLabel={append} />
      <Grid sx={{ mt: 1 }} alignItems='center'>
        {fields.map((label, index) => (
          <LabelItem
            systemLabel={label.external}
            key={label.id}
            labelName={label.name}
            removable
            unfilled
            onRemoveClick={() => remove(index)}
          />
        ))}
      </Grid>
    </form>
  );

  const formActionButtons = () => (
    <Button
      text='Save'
      buttonType='main-lg'
      type='submit'
      form='dataset-field-labels-form'
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

export default DatasetFieldLabelsForm;
