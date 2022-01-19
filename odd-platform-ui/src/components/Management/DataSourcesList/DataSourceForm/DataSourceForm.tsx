import React, { ChangeEvent } from 'react';
import capitalize from 'lodash/capitalize';
import reduce from 'lodash/reduce';
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
} from 'generated-sources';
import DialogWrapper from 'components/shared/DialogWrapper/DialogWrapper';
import {
  Checkbox,
  FormControlLabel,
  Grid,
  MenuItem,
  RadioGroup,
  Typography,
} from '@mui/material';
import AppButton from 'components/shared/AppButton/AppButton';
import AppTextField from 'components/shared/AppTextField/AppTextField';
import ClearIcon from 'components/shared/Icons/ClearIcon';
import { Asterisk } from 'components/Management/DataSourcesList/DataSourceForm/DataSourceFormStyles';
import NamespaceAutocompleteContainer from 'components/Management/DataSourcesList/DataSourceForm/NamespaceAutocomplete/NamespaceAutocompleteContainer';
import AppRadio from 'components/shared/AppRadio/AppRadio';

interface DataSourceFormDialogProps {
  btnCreateEl: JSX.Element;
  isLoading: boolean;
  dataSource?: DataSource;
  registerDataSource: (
    params: DataSourceApiRegisterDataSourceRequest
  ) => Promise<DataSource>;
  updateDataSource: (
    params: DataSourceApiUpdateDataSourceRequest
  ) => Promise<DataSource>;
}

export type DataSourceFormDataValues = Omit<
  DataSourceFormData,
  'pullingInterval'
> & {
  pullingInterval: { value?: number; format: string };
};

const DataSourceForm: React.FC<DataSourceFormDialogProps> = ({
  dataSource,
  btnCreateEl,
  isLoading,
  registerDataSource,
  updateDataSource,
}) => {
  const getDefaultValues = React.useCallback(
    (): DataSourceFormDataValues => ({
      name: dataSource?.name || '',
      oddrn: dataSource?.oddrn || '',
      namespaceName: dataSource?.namespace?.name || '',
      connectionUrl: dataSource?.connectionUrl || '',
      description: dataSource?.description || '',
      active: !!dataSource?.active || false,
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
    setValue,
    formState: { isValid },
  } = useForm<DataSourceFormDataValues>({
    mode: 'all',
    reValidateMode: 'onChange',
    defaultValues: getDefaultValues(),
  });

  React.useEffect(() => {
    reset(getDefaultValues());
  }, [dataSource]);

  const isPullingOn = watch('active', false);
  const initialState = { error: '', isSuccessfulSubmit: false };
  const [{ error, isSuccessfulSubmit }, setState] = React.useState<{
    error: string;
    isSuccessfulSubmit: boolean;
  }>(initialState);

  type RadioType = 'URL' | 'ODDRN';
  const getDefaultRadioValues = (): RadioType =>
    dataSource?.connectionUrl ? 'URL' : 'ODDRN';
  const [radioValue, setRadioValue] = React.useState<RadioType>(
    getDefaultRadioValues()
  );
  const isODDRN = () => radioValue === 'ODDRN';

  const handleRadioChange = (
    event: ChangeEvent<HTMLInputElement>,
    value: string
  ) => {
    setRadioValue(value as RadioType);
    setValue('connectionUrl', '');
    setValue('oddrn', '');
  };

  const recieveDataCheckbox = (
    <Controller
      defaultValue={false}
      name="active"
      control={control}
      render={({ field }) => (
        <FormControlLabel
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...field}
          sx={{ m: 0, mt: 1.5 }}
          checked={field.value}
          control={<Checkbox sx={{ mr: 1, p: 0 }} />}
          label="Receive data from current datasource"
        />
      )}
    />
  );

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

  const formTitle = (
    <Typography variant="h4" component="span">
      {dataSource ? 'Edit ' : 'Add '}
      Datasource
    </Typography>
  );

  const formContent = () => (
    <form id="datasource-create-form" onSubmit={handleSubmit(onSubmit)}>
      <Typography variant="subtitle2" fontSize="0.73rem">
        Fields with the <Asterisk>*</Asterisk> symbol are required to save
        the Datasource
      </Typography>
      <Controller
        name="name"
        control={control}
        rules={{
          required: true,
          validate: value => !!value.trim(),
        }}
        render={({ field }) => (
          <AppTextField
            {...field}
            sx={{ mt: 1.5 }}
            label="Name"
            placeholder="e.g. Data Tower"
            required
            customEndAdornment={{
              variant: 'clear',
              showAdornment: !!field.value,
              onCLick: () => field.onChange(''),
              icon: <ClearIcon />,
            }}
          />
        )}
      />
      <RadioGroup
        defaultValue={radioValue}
        value={radioValue}
        onChange={handleRadioChange}
        sx={{ mt: 1, ml: 0.5 }}
      >
        <Grid container>
          <FormControlLabel
            disabled={!!dataSource}
            value="ODDRN"
            control={<AppRadio />}
            label="ODDRN"
          />
          <FormControlLabel
            disabled={!!dataSource}
            value="URL"
            control={<AppRadio />}
            label="URL"
          />
        </Grid>
      </RadioGroup>
      {isODDRN() ? (
        <>
          <Controller
            name="oddrn"
            shouldUnregister
            control={control}
            rules={{
              required: true,
              validate: value => !!value?.trim(),
            }}
            render={({ field }) => (
              <AppTextField
                {...field}
                sx={{ mt: 1.5 }}
                label="ODDRN"
                placeholder="e.g. //kafka/"
                required
                customEndAdornment={{
                  variant: 'clear',
                  showAdornment: !!field.value,
                  onCLick: () => field.onChange(''),
                  icon: <ClearIcon />,
                }}
              />
            )}
          />
          {recieveDataCheckbox}
        </>
      ) : (
        <>
          <Controller
            name="connectionUrl"
            shouldUnregister
            control={control}
            rules={{
              required: true,
              validate: value => !!value?.trim(),
            }}
            render={({ field }) => (
              <AppTextField
                {...field}
                sx={{ mt: 1.25 }}
                label="URL"
                placeholder="e.g. https://github.com/link/example"
                required
                customEndAdornment={{
                  variant: 'clear',
                  showAdornment: !!field.value,
                  onCLick: () => field.onChange(''),
                  icon: <ClearIcon />,
                }}
              />
            )}
          />
          {recieveDataCheckbox}
          {isPullingOn && (
            <Grid container sx={{ mt: 1.5 }}>
              <Grid item xs={6} md={4} sx={{ mr: 1 }}>
                <Controller
                  name="pullingInterval.format"
                  control={control}
                  render={({ field }) => (
                    <>
                      <AppTextField
                        {...field}
                        label="Pulling Interval"
                        select
                      >
                        {['minutes', 'hours', 'days', 'weeks'].map(
                          value => (
                            <MenuItem key={value} value={value}>
                              {capitalize(value)}
                            </MenuItem>
                          )
                        )}
                      </AppTextField>
                    </>
                  )}
                />
              </Grid>
              <Grid item xs={6} md={4}>
                <Controller
                  name="pullingInterval.value"
                  control={control}
                  render={({ field }) => (
                    <AppTextField
                      {...field}
                      label="Value"
                      placeholder="e.g. 1"
                      type="number"
                      inputProps={{ min: 1 }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          )}
        </>
      )}
      <Controller
        control={control}
        name="namespaceName"
        defaultValue={dataSource?.namespace?.name}
        render={({ field }) => (
          <NamespaceAutocompleteContainer controllerProps={field} />
        )}
      />
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <AppTextField
            {...field}
            sx={{ mt: 1.25 }}
            label="Description"
            placeholder="Datasource description"
            multiline
            maxRows={4}
            customEndAdornment={{
              variant: 'clear',
              showAdornment: !!field.value,
              onCLick: () => setValue('description', ''),
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
      form="datasource-create-form"
      color="primary"
      fullWidth
      disabled={!isValid}
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

export default DataSourceForm;
