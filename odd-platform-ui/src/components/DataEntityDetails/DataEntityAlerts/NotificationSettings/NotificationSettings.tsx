import React from 'react';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { useAppParams } from 'lib/hooks';
import { type DataEntityApiUpdateAlertConfigRequest } from 'generated-sources';
import {
  getDataEntityAlertConfig,
  getDataEntityAlertsConfigUpdatingError,
  getDataEntityAlertsConfigUpdatingStatus,
} from 'redux/selectors';
import { Controller, useController, useForm } from 'react-hook-form';
import { updateDataEntityAlertsConfig } from 'redux/thunks';
import { FormControlLabel, Grid, Radio, RadioGroup, Typography } from '@mui/material';
import {
  AppButton,
  AppInput,
  AppRadio,
  AppSwitch,
  DialogWrapper,
} from 'components/shared';
import { ClearIcon } from 'components/shared/Icons';
import type { SerializeDateToNumber } from 'redux/interfaces';
import { minutesToMilliseconds } from 'date-fns';
import { toDateWithoutOffset } from 'lib/helpers';

interface NotificationSettingsProps {
  btnCreateEl: JSX.Element;
}

type FormData = SerializeDateToNumber<
  DataEntityApiUpdateAlertConfigRequest['dataEntityAlertConfig']
>;

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ btnCreateEl }) => {
  const dispatch = useAppDispatch();
  const { dataEntityId } = useAppParams();

  const config = useAppSelector(state => getDataEntityAlertConfig(state, dataEntityId));

  type TimeRange = (30 | 60 | 180 | 1440 | 10080) | number;
  const defaultTimeRange = 30;
  const defaultDisableNotification = React.useCallback(() => {
    if (config?.config?.incompatibleSchemaHaltUntil) return false;
    return true;
  }, [config]);
  console.log('def', defaultDisableNotification());
  const [disableNotification, setDisableNotification] = React.useState(() =>
    defaultDisableNotification()
  );
  const [timeRange, setTimeRange] = React.useState<TimeRange>(defaultTimeRange);

  const {
    isLoading: isDataEntityAlertConfigUpdating,
    isLoaded: isDataEntityAlertConfigUpdated,
  } = useAppSelector(getDataEntityAlertsConfigUpdatingStatus);
  const alertsConfigUpdatingError = useAppSelector(
    getDataEntityAlertsConfigUpdatingError
  );

  const getDefaultValues = React.useCallback(
    (): FormData => ({
      failedDqTestHaltUntil: config?.config?.failedDqTestHaltUntil,
      failedJobHaltUntil: config?.config?.failedJobHaltUntil,
      distributionAnomalyHaltUntil: config?.config?.distributionAnomalyHaltUntil,
      incompatibleSchemaHaltUntil: config?.config?.incompatibleSchemaHaltUntil,
    }),
    [config]
  );

  const { handleSubmit, control, reset, formState, watch } = useForm<FormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: getDefaultValues(),
  });

  const { field: schemaField } = useController<FormData>({
    control,
    name: 'incompatibleSchemaHaltUntil',
  });

  const clearState = React.useCallback(() => {
    reset();
  }, []);

  const handleSubmitForm = (dataEntityAlertConfig: FormData) => {
    console.log('formData', dataEntityAlertConfig);
    dispatch(updateDataEntityAlertsConfig({ dataEntityId, dataEntityAlertConfig })).then(
      () => clearState()
    );
  };

  const formTitle = (
    <Typography variant='h4' component='span'>
      Notification settings
    </Typography>
  );

  const getEndTimeInMs = (value: string | number) => {
    const rangeInMinutes = Number(value) ?? 0;
    const rangeInMs = minutesToMilliseconds(rangeInMinutes);
    const currentDateInMs = new Date().getTime();
    const endDateInMs = currentDateInMs + rangeInMs;

    return endDateInMs;
  };

  const handleRadioChange = (value: string, onChange: (val: unknown) => void) => {
    const rangeInMinutes = Number(value) ?? 0;
    // const rangeInMs = minutesToMilliseconds(rangeInMinutes);
    // const currentDateInMs = new Date().getTime();
    const endDateInMs = getEndTimeInMs(value);

    setTimeRange(rangeInMinutes);
    onChange(endDateInMs);
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisableNotification(prev => !prev);
    const endDateInMs = getEndTimeInMs(defaultTimeRange);
    console.log('dis', disableNotification);
    if (!disableNotification) {
      schemaField.onChange(endDateInMs);
    } else {
      schemaField.onChange(undefined);
    }
  };

  const formContent = () => (
    <form
      id='notification-settings-update-form'
      onSubmit={handleSubmit(handleSubmitForm)}
    >
      <Grid>
        <Typography variant='body2' color='texts.info'>
          Select the type of notifications and the period for which you want to disable
          notifications
        </Typography>
      </Grid>
      <Controller
        name='incompatibleSchemaHaltUntil'
        control={control}
        defaultValue={30}
        render={({ field }) => (
          <Grid container flexDirection='column'>
            <Grid
              sx={{ mt: 1.5 }}
              container
              flexWrap='nowrap'
              alignItems='center'
              justifyContent='space-between'
            >
              <Typography variant='body1'>
                Backwords incompatible schema change
              </Typography>
              <AppSwitch checked={!disableNotification} onChange={handleSwitchChange} />
            </Grid>
            {disableNotification && (
              <RadioGroup
                {...field}
                defaultValue={30}
                value={timeRange}
                onChange={e => handleRadioChange(e.target.value, field.onChange)}
              >
                <FormControlLabel
                  value={30}
                  control={<AppRadio />}
                  label='Half an hour'
                />
                <FormControlLabel value={60} control={<AppRadio />} label='Hour' />
                <FormControlLabel value={180} control={<AppRadio />} label='3 hours' />
                <FormControlLabel value={1440} control={<AppRadio />} label='1 day' />
                <FormControlLabel value={10080} control={<AppRadio />} label='Week' />
              </RadioGroup>
            )}
          </Grid>
        )}
      />
      <Grid>
        <Typography variant='caption' letterSpacing='0.01em'>
          When the time is up, the notifications type “Fail job” will turn on
          automatically.
        </Typography>
      </Grid>
    </form>
  );

  const formActionButtons = () => (
    <AppButton
      size='large'
      type='submit'
      form='notification-settings-update-form'
      color='primary'
      fullWidth
    >
      Apply
    </AppButton>
  );

  return (
    <DialogWrapper
      maxWidth='xs'
      renderOpenBtn={({ handleOpen }) =>
        React.cloneElement(btnCreateEl, {
          onClick: () => {
            clearState();
            handleOpen();
          },
        })
      }
      title={formTitle}
      renderContent={formContent}
      renderActions={formActionButtons}
      handleCloseSubmittedForm={isDataEntityAlertConfigUpdated}
      isLoading={isDataEntityAlertConfigUpdating}
      errorText={alertsConfigUpdatingError?.message}
      clearState={clearState}
    />
  );
};

export default NotificationSettings;
