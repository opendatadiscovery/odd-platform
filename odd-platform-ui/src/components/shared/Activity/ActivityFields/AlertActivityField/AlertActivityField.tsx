import React from 'react';
import type { ActivityEventType, AlertHaltConfigActivityState } from 'generated-sources';
import type { Activity } from 'redux/interfaces';
import { Grid, Typography } from '@mui/material';
import { stringFormatted } from 'lib/helpers';
import { alertTitlesMap } from 'lib/constants';
import { useAppDateTime } from 'lib/hooks';

interface AlertActivityFieldProps {
  eventType: ActivityEventType;
  oldState: Activity['oldState'];
  newState: Activity['newState'];
}

const AlertActivityField: React.FC<AlertActivityFieldProps> = ({
  eventType,
  oldState,
  newState,
}) => {
  const { alertFormattedDateTime } = useAppDateTime();

  const alertLayout = (type: string | undefined, text: string) => (
    <Grid container mt={0.5}>
      <Typography variant='body1' fontWeight={500} mr={0.5}>
        {type}
      </Typography>
      {text}
    </Grid>
  );

  if (eventType === 'OPEN_ALERT_RECEIVED') {
    return alertLayout(
      newState.openAlertReceived?.type &&
        alertTitlesMap.get(newState.openAlertReceived?.type),
      'open alert was received'
    );
  }

  if (eventType === 'RESOLVED_ALERT_RECEIVED') {
    return alertLayout(
      newState.resolvedAlertReceived?.type &&
        alertTitlesMap.get(newState.resolvedAlertReceived?.type),
      'resolved alert was received'
    );
  }

  if (eventType === 'ALERT_STATUS_UPDATED') {
    return alertLayout(
      newState.alertStatusUpdated?.type &&
        alertTitlesMap.get(newState.alertStatusUpdated?.type),
      `alert was ${stringFormatted(
        newState.alertStatusUpdated?.status || '',
        '_',
        'uncapitalizing'
      )}`
    );
  }

  const alertConfigLayout = (type: string | undefined, text: string, date?: number) => (
    <Grid container mt={0.5}>
      Alerts for
      <Typography variant='body1' fontWeight={500} mx={0.5}>
        {type}
      </Typography>
      {text}
      <Typography variant='body1' fontWeight={500} ml={0.5}>
        {date && alertFormattedDateTime(date)}
      </Typography>
    </Grid>
  );

  type AlertHaltConfigEntriesType = [
    keyof AlertHaltConfigActivityState,
    number | undefined
  ][];
  const alertHaltConfigEntries = newState.alertHaltConfig
    ? (Object.entries(newState.alertHaltConfig) as AlertHaltConfigEntriesType)
    : undefined;

  return (
    <Grid container flexDirection='column'>
      {alertHaltConfigEntries?.map(([alertConfigType, date]) => {
        if (date)
          return alertConfigLayout(
            alertTitlesMap.get(alertConfigType),
            'was disabled until',
            date
          );

        if (oldState.alertHaltConfig?.[alertConfigType] && !date)
          return alertConfigLayout(alertTitlesMap.get(alertConfigType), 'was enabled');

        return null;
      })}
    </Grid>
  );
};

export default AlertActivityField;
