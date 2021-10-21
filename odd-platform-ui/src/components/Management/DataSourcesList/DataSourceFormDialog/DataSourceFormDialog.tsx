import React from 'react';
import {
  FormControlLabel,
  Typography,
  Grid,
  Select,
  MenuItem,
  TextField,
  Checkbox,
  InputLabel,
  CircularProgress,
} from '@material-ui/core';
import { Autocomplete, createFilterOptions } from '@material-ui/lab';
import { useDebouncedCallback } from 'use-debounce/lib';
import { capitalize, reduce } from 'lodash';
import {
  add,
  addSeconds,
  differenceInSeconds,
  intervalToDuration,
} from 'date-fns/esm';
import { useForm, Controller } from 'react-hook-form';
import {
  DataSourceFormData,
  DataSource,
  DataSourceApiRegisterDataSourceRequest,
  DataSourceApiUpdateDataSourceRequest,
  Namespace,
  NamespaceApiGetNamespaceListRequest,
  NamespaceList,
} from 'generated-sources';
import OutlinedTextField from 'components/shared/OutlinedTextField/OutlinedTextField';
import DialogWrapper from 'components/shared/DialogWrapper/DialogWrapper';
import AppButton from 'components/shared/AppButton/AppButton';
import AutocompleteSuggestion from 'components/shared/AutocompleteSuggestion/AutocompleteSuggestion';
import { StylesType } from './DataSourceFormDialogStyles';

interface DataSourceFormDialogProps extends StylesType {
  btnCreateEl: JSX.Element;
  isLoading: boolean;
  dataSource?: DataSource;
  registerDataSource: (
    params: DataSourceApiRegisterDataSourceRequest
  ) => Promise<DataSource>;
  updateDataSource: (
    params: DataSourceApiUpdateDataSourceRequest
  ) => Promise<DataSource>;
  searchNamespace: (
    params: NamespaceApiGetNamespaceListRequest
  ) => Promise<NamespaceList>;
}

type DataSourceFormDataValues = Omit<
  DataSourceFormData,
  'pullingInterval'
> & {
  pullingInterval: { value?: number; format: string };
};

const DataSourceFormDialog: React.FC<DataSourceFormDialogProps> = ({
  classes,
  dataSource,
  btnCreateEl,
  isLoading,
  registerDataSource,
  updateDataSource,
  searchNamespace,
}) => {
  const getDefaultValues = React.useCallback(
    (): DataSourceFormDataValues => ({
      name: '',
      oddrn: '',
      namespaceName: dataSource?.namespace?.name || '',
      connectionUrl: '',
      description: '',
      ...dataSource,
      active: !!dataSource?.active,
      pullingInterval: dataSource?.pullingInterval
        ? reduce(
            intervalToDuration({
              start: Date.now(),
              end: addSeconds(Date.now(), dataSource?.pullingInterval),
            }),
            (result, value, format) =>
              value && value > 0 ? { format, value } : result,
            { format: 'minutes', value: 1 }
          )
        : { format: 'minutes', value: 1 },
    }),
    [dataSource]
  );

  const {
    watch,
    handleSubmit,
    control,
    reset,
    formState: { isValid },
  } = useForm<DataSourceFormDataValues>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: getDefaultValues(),
  });

  React.useEffect(() => {
    reset(getDefaultValues());
  }, [dataSource]);

  const isCheckboxDisabled = watch('connectionUrl', '')?.length === 0;
  const isPullingOn = watch('active', false);
  const initialState = { error: '', isSuccessfulSubmit: false };
  const [{ error, isSuccessfulSubmit }, setState] = React.useState<{
    error: string;
    isSuccessfulSubmit: boolean;
  }>(initialState);

  const clearState = () => {
    setState(initialState);
    reset();
  };

  const onSubmit = (data: DataSourceFormDataValues) => {
    const parsedData = {
      ...data,
      active: data.active,
      pullingInterval:
        data.active && data.pullingInterval?.value
          ? differenceInSeconds(
              add(Date.now(), {
                [data.pullingInterval.format]: data.pullingInterval.value,
              }),
              Date.now()
            )
          : dataSource?.pullingInterval,
    };
    (dataSource
      ? updateDataSource({
          dataSourceId: dataSource.id,
          dataSourceUpdateFormData: parsedData,
        })
      : registerDataSource({ dataSourceFormData: parsedData })
    ).then(
      () => {
        setState({ ...initialState, isSuccessfulSubmit: true });
        clearState();
      },
      (response: Response) => {
        setState({
          ...initialState,
          error: response.statusText || 'Unable to register datasource',
        });
      }
    );
  };

  // Namespace autocomplete
  type FilterOption = Omit<Namespace, 'id' | 'namespace'> &
    Partial<Namespace>;

  type FilterChangeOption = FilterOption | string | { inputValue: string };
  const [autocompleteOpen, setAutocompleteOpen] = React.useState(false);
  const [options, setOptions] = React.useState<FilterOption[]>([]);
  const filter = createFilterOptions<FilterOption>();
  const [searchText, setSearchText] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);

  const handleNamespaceSearch = React.useCallback(
    useDebouncedCallback(() => {
      setLoading(true);
      searchNamespace({ query: searchText, page: 1, size: 30 }).then(
        response => {
          setOptions(response.items);
          setLoading(false);
        }
      );
    }, 500),
    [setLoading, searchNamespace, setOptions, searchText]
  );

  React.useEffect(() => {
    setLoading(autocompleteOpen);
    if (autocompleteOpen) {
      handleNamespaceSearch();
    }
  }, [autocompleteOpen, searchText]);

  const handleInputChange = (
    _: React.ChangeEvent<unknown>,
    query: string
  ) => {
    setSearchText(query);
  };

  const handleOptionChange = React.useCallback(
    (onChange: (val?: string) => void) => (
      _: React.ChangeEvent<unknown>,
      newValue: FilterChangeOption | null
    ) => {
      let newField;
      if (newValue && typeof newValue === 'object') {
        if ('name' in newValue) {
          newField = newValue;
        }
      }

      // Create value from keyboard
      if (typeof newValue === 'string') {
        newField = {
          name: newValue,
        };
      }
      onChange(newField?.name || '');
    },
    []
  );

  const getFilterOptions = React.useCallback(
    (filterOptions, params) => {
      const filtered = filter(options, params);
      // Suggest the creation of a new value
      if (
        params.inputValue !== '' &&
        !loading &&
        !options.some(option => option.name === params.inputValue)
      ) {
        return [
          ...options,
          {
            name: params.inputValue,
          },
        ];
      }

      return filtered;
    },
    [loading]
  );

  const getOptionLabel = React.useCallback((option: FilterOption) => {
    // Value selected with enter, right from the input
    if (typeof option === 'string') {
      return option;
    }
    // Regular option
    if ('name' in option && option.name) {
      return option.name;
    }
    return '';
  }, []);

  const formTitle = (
    <Typography variant="h4">
      {dataSource ? 'Edit ' : 'Add '}
      Datasource
    </Typography>
  );

  const formContent = () => (
    <form
      className={classes.container}
      id="datasource-create-form"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Typography variant="subtitle2" className={classes.formTitle}>
        Fields with the <span className={classes.asterisk}>*</span> symbol
        are required to save the Datasource
      </Typography>
      <Controller
        name="name"
        control={control}
        rules={{
          required: true,
          validate: value => !!value.trim(),
        }}
        render={({ field }) => (
          <OutlinedTextField
            {...field}
            label="Name"
            placeholder="e.g. Data Tower"
            required
          />
        )}
      />
      <Controller
        name="oddrn"
        control={control}
        rules={{
          required: true,
          validate: value => !!value.trim(),
        }}
        render={({ field }) => (
          <OutlinedTextField
            {...field}
            label="ODDRN"
            placeholder="e.g. //kafka/"
            required
            disabled={!!dataSource}
          />
        )}
      />
      <Controller
        name="connectionUrl"
        control={control}
        rules={{
          required: true,
          validate: value => !!value.trim(),
        }}
        render={({ field }) => (
          <OutlinedTextField
            {...field}
            label="URL"
            placeholder="e.g. https://github.com/link/example"
            required
          />
        )}
      />
      <Controller
        name="active"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...field}
            className={classes.checkboxContainer}
            checked={field.value}
            control={<Checkbox className={classes.pullingCheckbox} />}
            label="Receive data from current datasource"
            disabled={isCheckboxDisabled}
          />
        )}
      />
      {isPullingOn ? (
        <Grid container spacing={1} className={classes.intervalContainer}>
          <Grid item xs={6} md={4}>
            <Controller
              name="pullingInterval.format"
              control={control}
              render={({ field }) => (
                <>
                  <InputLabel shrink id="pulling-interval">
                    Pulling Interval
                  </InputLabel>
                  <Select
                    {...field}
                    fullWidth
                    variant="outlined"
                    labelId="pulling-interval"
                  >
                    {['minutes', 'hours', 'days', 'weeks'].map(value => (
                      <MenuItem key={value} value={value}>
                        {capitalize(value)}
                      </MenuItem>
                    ))}
                  </Select>
                </>
              )}
            />
          </Grid>
          <Grid item xs={6} md={4}>
            <Controller
              name="pullingInterval.value"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  variant="outlined"
                  label="Value"
                  placeholder="e.g. 1"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    min: 1,
                  }}
                />
              )}
            />
          </Grid>
        </Grid>
      ) : null}
      <Controller
        name="namespaceName"
        defaultValue={dataSource?.namespace?.name || ''}
        control={control}
        render={({ field }) => (
          <Autocomplete
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...field}
            fullWidth
            id="namespace-name-search"
            open={autocompleteOpen}
            onOpen={() => {
              setAutocompleteOpen(true);
            }}
            onClose={() => {
              setAutocompleteOpen(false);
            }}
            onChange={handleOptionChange(field.onChange)}
            onInputChange={handleInputChange}
            getOptionLabel={getOptionLabel}
            options={options}
            filterOptions={getFilterOptions}
            loading={loading}
            freeSolo
            handleHomeEndKeys
            selectOnFocus
            renderInput={params => (
              <OutlinedTextField
                {...params}
                placeholder="Namespace"
                label="Namespace"
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
            renderOption={option => (
              <Typography variant="body2">
                {option.id ? (
                  option.name
                ) : (
                  <AutocompleteSuggestion
                    optionLabel="custom data"
                    optionName={option.name}
                  />
                )}
              </Typography>
            )}
          />
        )}
      />
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <OutlinedTextField
            {...field}
            label="Description"
            placeholder="Datasource description"
            multiline
            rows={4}
            rowsMax={4}
          />
        )}
      />
    </form>
  );

  const formActionButtons = () => (
    <AppButton
      size="large"
      type="submit"
      form="datasource-create-form"
      color="primary"
      fullWidth
      disabled={!isValid}
      onClick={() => {}}
    >
      Save
    </AppButton>
  );

  return (
    <DialogWrapper
      renderOpenBtn={({ handleOpen }) =>
        React.cloneElement(btnCreateEl, { onClick: handleOpen })
      }
      title={formTitle}
      renderContent={formContent}
      renderActions={formActionButtons}
      handleCloseSubmittedForm={isSuccessfulSubmit}
      isLoading={isLoading}
      errorText={error}
      clearState={clearState}
    />
  );
};

export default DataSourceFormDialog;
