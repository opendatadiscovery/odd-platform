import React from 'react';
import {
  Autocomplete,
  CircularProgress,
  TextField,
  Typography,
} from '@mui/material';
import {
  AutocompleteInputChangeReason,
  createFilterOptions,
} from '@mui/material/useAutocomplete';
import { useDebouncedCallback } from 'use-debounce';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import {
  DatasetFieldApiUpsertDatasetFieldLabelsRequest,
  Label,
  LabelApiGetLabelListRequest,
  LabelsResponse,
} from 'generated-sources';
import DialogWrapper from 'components/shared/DialogWrapper/DialogWrapper';
import AppButton from 'components/shared/AppButton/AppButton';
import LabelItem from 'components/shared/LabelItem/LabelItem';
import AutocompleteSuggestion from 'components/shared/AutocompleteSuggestion/AutocompleteSuggestion';
import { StylesType } from './LabelsEditFormStyles';

interface LabelsEditProps extends StylesType {
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

const LabelsEditForm: React.FC<LabelsEditProps> = ({
  classes,
  datasetFieldId,
  datasetFieldLabels,
  isLoading,
  updateDataSetFieldLabels,
  searchLabels,
  btnCreateEl,
}) => {
  // Autocomplete
  type FilterOption = Omit<Label, 'id'> & Partial<Label>;
  const [options, setOptions] = React.useState<FilterOption[]>([]);
  const [autocompleteOpen, setAutocompleteOpen] = React.useState(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [searchText, setSearchText] = React.useState<string>('');
  const filter = createFilterOptions<FilterOption>();

  const handleSearch = React.useCallback(
    useDebouncedCallback(() => {
      setLoading(true);
      searchLabels({ page: 1, size: 30, query: searchText }).then(
        response => {
          setLoading(false);
          setOptions(response.items);
        }
      );
    }, 500),
    [searchLabels, setLoading, setOptions, searchText]
  );

  const getOptionLabel = React.useCallback((option: FilterOption) => {
    if (typeof option === 'string') {
      return option;
    }
    if ('name' in option && option.name) {
      return option.name;
    }
    return '';
  }, []);

  const getFilterOptions = React.useCallback(
    (filterOptions, params) => {
      const filtered = filter(options, params);
      if (
        searchText !== '' &&
        !loading &&
        !options.find(
          option =>
            option.name.toLocaleLowerCase() ===
            searchText.toLocaleLowerCase()
        )
      ) {
        return [...options, { name: searchText }];
      }
      return filtered;
    },
    [searchText, loading, options]
  );

  const searchInputChange = React.useCallback(
    (
      _: React.ChangeEvent<unknown>,
      query: string,
      reason: AutocompleteInputChangeReason
    ) => {
      if (reason === 'input') {
        setSearchText(query);
      } else {
        setSearchText(''); // Clear input on select
      }
    },
    [setSearchText]
  );

  React.useEffect(() => {
    setLoading(autocompleteOpen);
    if (autocompleteOpen) {
      handleSearch();
    }
  }, [autocompleteOpen, searchText]);

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

  const handleAutocompleteSelect = (
    _: React.ChangeEvent<unknown>,
    value: FilterOption | string | null
  ) => {
    if (!value) return;
    setSearchText(''); // Clear input on select
    append(typeof value === 'string' ? { name: value } : value);
  };

  const handleRemove = (index: number) => () => {
    remove(index);
  };

  const formTitle = <Typography variant="h4">Edit labels</Typography>;

  const formContent = () => (
    <>
      <Autocomplete
        fullWidth
        id="datasetfield-label-add-name-search"
        open={autocompleteOpen}
        onOpen={() => setAutocompleteOpen(true)}
        onClose={() => setAutocompleteOpen(false)}
        onChange={handleAutocompleteSelect}
        options={options}
        onInputChange={searchInputChange}
        getOptionLabel={getOptionLabel}
        filterOptions={getFilterOptions}
        loading={loading}
        handleHomeEndKeys
        selectOnFocus
        blurOnSelect
        freeSolo
        value={{ name: searchText }}
        renderInput={params => (
          <TextField
            {...params}
            className={classes.labelInput}
            placeholder="Enter label name…"
            variant="outlined"
            fullWidth
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        renderOption={(props, option) => (
          <li {...props}>
            <div className={classes.optionsContainer}>
              <div className={classes.optionItem}>
                <Typography variant="body1">
                  {option.id ? (
                    option.name
                  ) : (
                    <AutocompleteSuggestion
                      optionLabel="label"
                      optionName={option.name}
                    />
                  )}
                </Typography>
              </div>
            </div>
          </li>
        )}
        // renderOption={option => (
        //   <div className={classes.optionsContainer}>
        //     <div className={classes.optionItem}>
        //       <Typography variant="body1">
        //         {option.id ? (
        //           option.name
        //         ) : (
        //           <AutocompleteSuggestion
        //             optionLabel="label"
        //             optionName={option.name}
        //           />
        //         )}
        //       </Typography>
        //     </div>
        //   </div>
        // )}
      />
      <FormProvider {...methods}>
        <form
          id="label-create-form"
          onSubmit={methods.handleSubmit(handleSubmit)}
        >
          <div className={classes.labelsList}>
            {fields?.map((field, index) => (
              <LabelItem
                key={field.id}
                labelName={field.name}
                removable
                unfilled
                onRemoveClick={handleRemove(index)}
              />
            ))}
          </div>
        </form>
      </FormProvider>
    </>
  );

  const formActionButtons = () => (
    <>
      <AppButton
        size="large"
        type="submit"
        form="label-create-form"
        color="primary"
        fullWidth
        onClick={() => {}}
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

export default LabelsEditForm;
