import React from 'react';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { useAppParams } from 'lib/hooks';
import { type DataEntityApiUpdateAlertConfigRequest } from 'generated-sources';
import {
  getDataEntityAlertsConfigFetchingStatus,
  getDataEntityAlertsConfigUpdatingError,
  getDataEntityAlertsConfigUpdatingStatus,
} from 'redux/selectors';
import { useForm } from 'react-hook-form';
import { fetchDataEntityAlertsConfig, updateDataEntityAlertsConfig } from 'redux/thunks';
import { Grid, Typography } from '@mui/material';
import { Button, AppCircularProgress, DialogWrapper } from 'components/shared/elements';
import type { SerializeDateToNumber } from 'redux/interfaces';
import AlertTypeRange from './AlertTypeRange/AlertTypeRange';

interface NotificationSettingsProps {
  btnCreateEl: JSX.Element;
}

export type FormData = SerializeDateToNumber<
  DataEntityApiUpdateAlertConfigRequest['dataEntityAlertConfig']
>;

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ btnCreateEl }) => {
  const dispatch = useAppDispatch();
  const { dataEntityId } = useAppParams();

  const { isLoading: isDataEntityAlertConfigFetching } = useAppSelector(
    getDataEntityAlertsConfigFetchingStatus
  );
  const {
    isLoading: isDataEntityAlertConfigUpdating,
    isLoaded: isDataEntityAlertConfigUpdated,
  } = useAppSelector(getDataEntityAlertsConfigUpdatingStatus);
  const alertsConfigUpdatingError = useAppSelector(
    getDataEntityAlertsConfigUpdatingError
  );

  const { handleSubmit, control, reset } = useForm<FormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const clearState = React.useCallback(() => {
    reset();
  }, []);

  const handleSubmitForm = (dataEntityAlertConfig: FormData) => {
    dispatch(updateDataEntityAlertsConfig({ dataEntityId, dataEntityAlertConfig })).then(
      () => clearState()
    );
  };

  const formTitle = (
    <Typography variant='h4' component='span'>
      Notification settings
    </Typography>
  );

  const formContent = () =>
    isDataEntityAlertConfigFetching ? (
      <Grid container justifyContent='center'>
        <AppCircularProgress
          background='transparent'
          progressBackground='dark'
          size={30}
        />
      </Grid>
    ) : (
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
        <AlertTypeRange
          key='incompatibleSchemaHaltUntil'
          name='incompatibleSchemaHaltUntil'
          control={control}
        />
        <AlertTypeRange
          key='failedDqTestHaltUntil'
          name='failedDqTestHaltUntil'
          control={control}
        />
        <AlertTypeRange
          key='failedJobHaltUntil'
          name='failedJobHaltUntil'
          control={control}
        />
        <AlertTypeRange
          key='distributionAnomalyHaltUntil'
          name='distributionAnomalyHaltUntil'
          control={control}
        />
        <Grid sx={{ mt: 1.5 }}>
          <Typography variant='caption' letterSpacing='0.01em'>
            When the time is up, disabled alert types will turn on automatically.
          </Typography>
        </Grid>
      </form>
    );

  const formActionButtons = () => (
    <Button
      text='Apply'
      buttonType='main-lg'
      type='submit'
      form='notification-settings-update-form'
      fullWidth
    />
  );

  return (
    <DialogWrapper
      maxWidth='sm'
      renderOpenBtn={({ handleOpen }) =>
        React.cloneElement(btnCreateEl, {
          onClick: () => {
            clearState();
            handleOpen();
            dispatch(fetchDataEntityAlertsConfig({ dataEntityId }));
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
