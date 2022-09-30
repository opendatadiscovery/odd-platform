import React from 'react';
import { Typography } from '@mui/material';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import {
  getDatasetFieldData,
  getDatasetFieldFormDataUpdatingStatus,
} from 'redux/selectors';
import { updateDataSetFieldFormData } from 'redux/thunks';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import {
  AppButton,
  AppInput,
  DialogWrapper,
  LabelItem,
} from 'components/shared';
import { ClearIcon } from 'components/shared/Icons';
import LabelsAutocomplete from './LabelsAutocomplete/LabelsAutocomplete';
import * as S from './DatasetFieldInfoEditFormStyles';

interface DataSetFieldInfoEditFormProps {
  datasetFieldId: number;
  btnCreateEl: JSX.Element;
}

type DatasetFieldInfoFormType = {
  labels: { name: string; external?: boolean }[];
  internalDescription: string;
};

const DatasetFieldInfoEditForm: React.FC<
  DataSetFieldInfoEditFormProps
> = ({ datasetFieldId, btnCreateEl }) => {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector(
    getDatasetFieldFormDataUpdatingStatus
  );
  const datasetFieldFormData = useAppSelector(
    getDatasetFieldData(datasetFieldId)
  );

  const methods = useForm<DatasetFieldInfoFormType>({
    defaultValues: {
      labels: datasetFieldFormData.labels.map(label => ({
        name: label.name,
        external: label.external,
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
        external: label.external,
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
    dispatch(
      updateDataSetFieldFormData({
        datasetFieldId,
        datasetFieldUpdateFormData: {
          labelNames: data.labels.map(label => label.name),
          description: data.internalDescription.trim() || undefined,
        },
      })
    ).then(
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
            systemLabel={label.external}
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
            multiline
            maxRows={4}
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
