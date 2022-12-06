import React from 'react';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { useAppParams } from 'lib/hooks';
import { type DataEntityApiUpdateAlertConfigRequest } from 'generated-sources';
import {
  getDataEntityAlertConfig,
  getDataEntityAlertsConfigUpdatingError,
  getDataEntityAlertsConfigUpdatingStatus,
} from 'redux/selectors';
import { Controller, useForm } from 'react-hook-form';
import { updateDataEntityAlertsConfig } from 'redux/thunks';
import { Grid, Typography } from '@mui/material';
import { AppButton, AppInput, DialogWrapper } from 'components/shared';
import { ClearIcon } from 'components/shared/Icons';
import type { SerializeDateToNumber } from 'redux/interfaces';

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

  const clearState = React.useCallback(() => {
    reset();
  }, []);

  const handleSubmitForm = (dataEntityAlertConfig: FormData) => {
    console.log('da', dataEntityAlertConfig);
    dispatch(updateDataEntityAlertsConfig({ dataEntityId, dataEntityAlertConfig })).then(
      () => clearState()
    );
  };

  const formTitle = (
    <Typography variant='h4' component='span'>
      Notification settings
    </Typography>
  );

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
      {/* <Controller */}
      {/*   name='name' */}
      {/*   control={control} */}
      {/*   rules={{ required: true, validate: value => !!value.trim() }} */}
      {/*   render={({ field }) => ( */}
      {/*     <AppInput */}
      {/*       {...field} */}
      {/*       placeholder='Data Entity Group Name' */}
      {/*       label='Name' */}
      {/*       customEndAdornment={{ */}
      {/*         variant: 'clear', */}
      {/*         showAdornment: !!field.value, */}
      {/*         onCLick: () => field.onChange(''), */}
      {/*         icon: <ClearIcon />, */}
      {/*       }} */}
      {/*     /> */}
      {/*   )} */}
      {/* /> */}
      <Grid>
        <Typography variant='caption'>
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
