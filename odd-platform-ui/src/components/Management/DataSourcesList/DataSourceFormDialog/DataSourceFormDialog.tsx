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
} from '@material-ui/core';
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
} from 'generated-sources';
import OutlinedTextField from 'components/shared/OutlinedTextField/OutlinedTextField';
import DialogWrapper from 'components/shared/DialogWrapper/DialogWrapper';
import AppButton from 'components/shared/AppButton/AppButton';
import { StylesType } from './DataSourceFormDialogStyles';

interface DataSourceFormDialogProps extends StylesType {
  btnCreateEl: JSX.Element;
  isLoading: boolean;
  registerDataSource: (
    params: DataSourceApiRegisterDataSourceRequest
  ) => Promise<DataSource>;
  updateDataSource: (
    params: DataSourceApiUpdateDataSourceRequest
  ) => Promise<DataSource>;
  dataSource?: DataSource;
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
}) => {
  const getDefaultValues = React.useCallback(
    (): DataSourceFormDataValues => ({
      name: '',
      oddrn: '',
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
