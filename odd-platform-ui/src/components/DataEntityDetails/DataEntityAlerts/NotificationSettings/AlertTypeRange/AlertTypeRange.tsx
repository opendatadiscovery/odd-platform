import React from 'react';
import { FormControlLabel, Grid, RadioGroup, Typography } from '@mui/material';
import { Button, AppRadio, AppSwitch } from 'components/shared/elements';
import { useController, type UseControllerProps } from 'react-hook-form';
import { useAppSelector } from 'redux/lib/hooks';
import { getDataEntityAlertConfig } from 'redux/selectors';
import { useAppDateTime, useAppParams } from 'lib/hooks';
import { type FormData } from '../NotificationSettings';

type TimeRange = number;
type StringTimeRange = 'Half an hour' | 'Hour' | '3 hours' | '1 day' | 'Week';

interface AlertTypeRangeProps {
  control: UseControllerProps<FormData>['control'];
  name: UseControllerProps<FormData>['name'];
}

const AlertTypeRange: React.FC<AlertTypeRangeProps> = ({ control, name }) => {
  const { dataEntityId } = useAppParams();
  const { formatDuration, intervalToDuration, minutesToMilliseconds } = useAppDateTime();
  const config = useAppSelector(state => getDataEntityAlertConfig(state, dataEntityId));

  const namesMap = new Map<keyof FormData, string>([
    ['incompatibleSchemaHaltUntil', 'Backwards incompatible schema change'],
    ['failedDqTestHaltUntil', 'Failed data quality test'],
    ['failedJobHaltUntil', 'Failed job'],
    ['distributionAnomalyHaltUntil', 'Distribution anomaly'],
  ]);
  const defaultRangesMap = new Map<StringTimeRange, TimeRange>([
    ['Half an hour', 30],
    ['Hour', 60],
    ['3 hours', 180],
    ['1 day', 1440],
    ['Week', 10080],
  ]);
  const defaultValue = React.useMemo(() => config?.config?.[name], [config]);
  const defaultTimeRange = 30;
  const [disableNotification, setDisableNotification] = React.useState(!!defaultValue);
  const [isValueUpdated, setIsValueUpdated] = React.useState(false);
  const [timeRange, setTimeRange] = React.useState<TimeRange>(defaultTimeRange);
  const [showEndTime, setShowEndTime] = React.useState(false);

  const { field } = useController({
    control,
    name,
    defaultValue,
  });

  const getEndTimeInMs = (value: string | number) => {
    const rangeInMinutes = Number(value ?? 0);
    const rangeInMs = minutesToMilliseconds(rangeInMinutes);
    const currentDateInMs = new Date().getTime();

    return currentDateInMs + rangeInMs;
  };

  const getRangeToEnableNotification = () => {
    if (!defaultValue) return '';

    const endTime = defaultValue;
    const currentTime = new Date().getTime();

    if (endTime - currentTime < 0) {
      setShowEndTime(false);
      return field.onChange(undefined);
    }

    const duration = intervalToDuration({
      start: new Date(),
      end: new Date(defaultValue),
    });

    const stringDuration = formatDuration(duration, {
      format: ['months', 'weeks', 'days', 'hours', 'minutes', 'seconds'],
    });
    setShowEndTime(true);
    return stringDuration;
  };

  const rangeToEnableNotification = React.useMemo(
    () => getRangeToEnableNotification(),
    [defaultValue]
  );

  const handleRadioChange = (value: string, onChange: (val: unknown) => void) => {
    const rangeInMinutes = Number(value ?? 0);
    const endDateInMs = getEndTimeInMs(value);

    setTimeRange(rangeInMinutes);
    onChange(endDateInMs);
  };

  const handleSwitchChange = () => {
    setDisableNotification(prev => !prev);
    const endDateInMs = getEndTimeInMs(defaultTimeRange);

    if (!disableNotification) {
      field.onChange(endDateInMs);
      setIsValueUpdated(true);
    } else {
      field.onChange(undefined);
      setIsValueUpdated(true);
    }
  };

  return (
    <Grid container flexDirection='column'>
      <Grid
        sx={{ mt: 1.5 }}
        container
        flexWrap='nowrap'
        alignItems='center'
        justifyContent='space-between'
      >
        <Grid container flexDirection='column' sx={{ ml: 1 }}>
          <Typography variant='body1'>{namesMap.get(name)}</Typography>
          {showEndTime && (
            <Grid container flexWrap='nowrap' alignItems='center'>
              <Typography variant='caption'>{`${rangeToEnableNotification} to turn on`}</Typography>
              <Button
                text='Edit'
                sx={{ ml: 0.5 }}
                buttonType='tertiary-m'
                onClick={() => setIsValueUpdated(prev => !prev)}
              />
            </Grid>
          )}
        </Grid>
        <AppSwitch checked={!disableNotification} onChange={handleSwitchChange} />
      </Grid>
      {disableNotification && isValueUpdated && (
        <RadioGroup
          {...field}
          sx={{ ml: 4 }}
          value={timeRange}
          onChange={e => handleRadioChange(e.target.value, field.onChange)}
        >
          <FormControlLabel
            value={defaultRangesMap.get('Half an hour')}
            control={<AppRadio />}
            label='Half an hour'
          />
          <FormControlLabel
            value={defaultRangesMap.get('Hour')}
            control={<AppRadio />}
            label='Hour'
          />
          <FormControlLabel
            value={defaultRangesMap.get('3 hours')}
            control={<AppRadio />}
            label='3 hours'
          />
          <FormControlLabel
            value={defaultRangesMap.get('1 day')}
            control={<AppRadio />}
            label='1 day'
          />
          <FormControlLabel
            value={defaultRangesMap.get('Week')}
            control={<AppRadio />}
            label='Week'
          />
        </RadioGroup>
      )}
    </Grid>
  );
};

export default AlertTypeRange;
