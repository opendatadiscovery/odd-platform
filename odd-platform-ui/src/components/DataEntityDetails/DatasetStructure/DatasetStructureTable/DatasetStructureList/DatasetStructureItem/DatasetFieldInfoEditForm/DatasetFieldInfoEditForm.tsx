import React from 'react';
import { Typography } from '@mui/material';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import {
  DataSetField,
  DatasetFieldApiUpdateDatasetFieldRequest,
} from 'generated-sources';
import DialogWrapper from 'components/shared/DialogWrapper/DialogWrapper';
import LabelItem from 'components/shared/LabelItem/LabelItem';
import AppButton from 'components/shared/AppButton/AppButton';
import AppInput from 'components/shared/AppInput/AppInput';
import ClearIcon from 'components/shared/Icons/ClearIcon';
import LabelsAutocomplete from './LabelsAutocomplete/LabelsAutocomplete';
import * as S from './DatasetFieldInfoEditFormStyles';

interface DataSetFieldInfoEditFormProps {
  datasetFieldId: number;
  datasetFieldFormData: {
    internalDescription: string;
    labels: { name: string }[];
  };
  isLoading: boolean;
  updateDataSetFieldFormData: (
    params: DatasetFieldApiUpdateDatasetFieldRequest
  ) => Promise<DataSetField>;
  btnCreateEl: JSX.Element;
}

type DatasetFieldInfoFormType = {
  labels: { name: string }[];
  internalDescription: string;
};

const DatasetFieldInfoEditForm: React.FC<
  DataSetFieldInfoEditFormProps
> = ({
  datasetFieldId,
  datasetFieldFormData,
  isLoading,
  updateDataSetFieldFormData,
  btnCreateEl,
}) => {
  const methods = useForm<DatasetFieldInfoFormType>({
    defaultValues: {
      labels: datasetFieldFormData.labels.map(label => ({
        name: label.name,
      })),
      internalDescription: datasetFieldFormData.internalDescription,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: 'labels',
  });

  const initialFormState = { error: '', isSuccessfulSubmit: false };
  const [{ error, isSuccessfulSubmit }, setFormState] = React.useState<{
    error: string;
    isSuccessfulSubmit: boolean;
  }>(initialFormState);

  const onOpen = (handleOpen: () => void) => () => {
    if (btnCreateEl.props.onClick) btnCreateEl.props.onClick();
    methods.reset({
      labels: datasetFieldFormData.labels.map(label => ({
        name: label.name,
      })),
      internalDescription: datasetFieldFormData.internalDescription,
    });
    handleOpen();
  };

  const clearFormState = () => {
    setFormState(initialFormState);
    methods.reset();
  };

  const handleFormSubmit = (data: DatasetFieldInfoFormType) => {
    updateDataSetFieldFormData({
      datasetFieldId,
      datasetFieldUpdateFormData: {
        labelNames: data.labels.map(label => label.name),
        description: data.internalDescription,
      },
    }).then(
      () => {
        setFormState({ ...initialFormState, isSuccessfulSubmit: true });
        clearFormState();
      },
      (response: Response) => {
        setFormState({
          ...initialFormState,
          error: response.statusText || 'Unable to update info',
        });
      }
    );
  };

  const formTitle = (
    <Typography variant="h4" component="span">
      Edit information
    </Typography>
  );

  const formContent = () => (
    <form
      id="dataset-field-info-form"
      onSubmit={methods.handleSubmit(handleFormSubmit)}
    >
      <Typography variant="h5" color="texts.info">
        Add or edit labels and description
      </Typography>
      <LabelsAutocomplete appendLabel={append} />
      <S.LabelItemsContainer sx={{ mt: 1, mb: 1.5 }}>
        {fields.map((label, index) => (
          <LabelItem
            key={label.id}
            labelName={label.name}
            removable
            unfilled
            onRemoveClick={() => remove(index)}
          />
        ))}
      </S.LabelItemsContainer>
      <Controller
        control={methods.control}
        name="internalDescription"
        defaultValue={datasetFieldFormData.internalDescription || ''}
        render={({ field }) => (
          <AppInput
            {...field}
            label="Description"
            placeholder="Enter description"
            customEndAdornment={{
              variant: 'clear',
              showAdornment: !!field.value,
              onCLick: () => methods.setValue('internalDescription', ''),
              icon: <ClearIcon />,
            }}
          />
        )}
      />
    </form>
  );

  const formActionButtons = () => (
    <AppButton
      size="large"
      type="submit"
      form="dataset-field-info-form"
      color="primary"
      fullWidth
    >
      Save
    </AppButton>
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
      isLoading={isLoading}
      errorText={error}
      formSubmitHandler={methods.handleSubmit(handleFormSubmit)}
    />
  );
};

export default DatasetFieldInfoEditForm;
