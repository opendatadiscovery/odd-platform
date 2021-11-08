import React from 'react';
import { Autocomplete, Box, Typography } from '@mui/material';
import {
  AutocompleteInputChangeReason,
  createFilterOptions,
} from '@mui/material/useAutocomplete';
import { useDebouncedCallback } from 'use-debounce';
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from 'react-hook-form';
import {
  DatasetFieldApiUpsertDatasetFieldLabelsRequest,
  Label,
  LabelApiGetLabelListRequest,
  LabelsResponse,
} from 'generated-sources';
import DialogWrapper from 'components/shared/DialogWrapper/DialogWrapper';
import LabelItem from 'components/shared/LabelItem/LabelItem';
import AutocompleteSuggestion from 'components/shared/AutocompleteSuggestion/AutocompleteSuggestion';
import AppButton from 'components/shared/AppButton/AppButton';
import AppTextField from 'components/shared/AppTextField/AppTextField';
import ClearIcon from 'components/shared/Icons/ClearIcon';
import LabelsAutocomplete from 'components/DataEntityDetails/DatasetStructure/StructureItemInfoEditForm/LabelsAutocomplete/LabelsAutocomplete';
import LabelsAutocompleteContainer from 'components/DataEntityDetails/DatasetStructure/StructureItemInfoEditForm/LabelsAutocomplete/LabelsAutocompleteContainer';

interface StructureItemInfoEditFormProps {
  datasetFieldId: number;
  datasetFieldLabels: Label[];
  isLoading: boolean;
  updateDataSetFieldLabels: (
    params: DatasetFieldApiUpsertDatasetFieldLabelsRequest
  ) => Promise<Label[]>;
  searchLabels: (
    params: LabelApiGetLabelListRequest
  ) => Promise<LabelsResponse>; // Temp
  btnCreateEl: JSX.Element;
}
type DatasetFieldLabelsFormType = { labelNameList: { name: string }[] };

const StructureItemInfoEditForm: React.FC<StructureItemInfoEditFormProps> = ({
  datasetFieldId,
  datasetFieldLabels,
  isLoading,
  updateDataSetFieldLabels,
  searchLabels,
  btnCreateEl,
}) => {
  // Labels list
  const methods = useForm<DatasetFieldLabelsFormType>();
  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: 'labelNameList',
  });

  const onOpen = (handleOpen: () => void) => () => {
    methods.reset({
      labelNameList: datasetFieldLabels.map(label => ({
        name: label.name,
      })),
    });
    if (btnCreateEl.props.onClick) btnCreateEl.props.onClick();
    handleOpen();
  };
  const initialFormState = { error: '', isSuccessfulSubmit: false };
  const [{ error, isSuccessfulSubmit }, setFormState] = React.useState<{
    error: string;
    isSuccessfulSubmit: boolean;
  }>(initialFormState);

  const clearFormState = () => {
    setFormState(initialFormState);
    methods.reset();
  };

  const handleSubmit = (data: DatasetFieldLabelsFormType) => {
    updateDataSetFieldLabels({
      datasetFieldId,
      datasetFieldLabelsFormData: {
        labelNameList: data.labelNameList.map(label => label.name),
      },
    }).then(
      () => {
        setFormState({ ...initialFormState, isSuccessfulSubmit: true });
        clearFormState();
      },
      (response: Response) => {
        setFormState({
          ...initialFormState,
          error: response.statusText || 'Unable to add labels',
        });
      }
    );
  };

  const handleRemove = (index: number) => () => {
    remove(index);
  };

  const formTitle = <Typography variant="h4">Edit labels</Typography>;

  const formContent = () => (
    <FormProvider {...methods}>
      <form
        id="label-create-form" // need new id
        onSubmit={methods.handleSubmit(handleSubmit)}
      >
        <Controller
          name="labelNameList"
          control={methods.control}
          render={({ field }) => (
            // eslint-disable-next-line react/jsx-props-no-spreading
            <LabelsAutocompleteContainer {...field} appendLabel={append} />
          )}
        />
        <Box sx={{ mt: 1 }}>
          {fields?.map((field, index) => (
            <LabelItem
              key={field.id}
              labelName={field.name}
              removable
              unfilled
              onRemoveClick={handleRemove(index)}
            />
          ))}
        </Box>
        <Controller
          control={methods.control}
          name="labelNameList"
          // defaultValue={datasetFieldIdInternalDescription || ''}
          render={({ field }) => (
            <AppTextField
              {...field}
              label="Description"
              placeholder="Enter description"
              // onKeyDown={handleKeyDown}
              customEndAdornment={{
                variant: 'clear',
                showAdornment: !!field.value,
                onCLick: () =>
                  methods.setValue('labelNameList', [{ name: '' }]),
                icon: <ClearIcon />,
              }}
            />
          )}
        />
      </form>
    </FormProvider>
  );

  const formActionButtons = () => (
    <>
      <AppButton
        size="large"
        type="submit"
        form="label-create-form"
        color="primary"
        fullWidth
      >
        Save
      </AppButton>
    </>
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
    />
  );
};

export default StructureItemInfoEditForm;
