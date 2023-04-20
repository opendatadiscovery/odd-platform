import React from 'react';
import { Grid, Typography } from '@mui/material';
import { type EventType } from 'lib/interfaces';
import ActivityFieldHeader from 'components/shared/elements/Activity/ActivityFields/ActivityFieldHeader/ActivityFieldHeader';
import ActivityFieldState from 'components/shared/elements/Activity/ActivityFields/ActivityFieldState/ActivityFieldState';

interface ActivityFieldData {
  oldValue: string;
  newValue: string;
  activityEvent: EventType;
}

interface StringActivityFieldProps {
  oldState: string | undefined;
  newState: string | undefined;
  hideAllDetails: boolean;
  activityName: string;
  startText?: string;
}

const StringActivityField: React.FC<StringActivityFieldProps> = ({
  oldState,
  newState,
  hideAllDetails,
  activityName,
  startText = '',
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);

  React.useEffect(() => setIsDetailsOpen(false), [hideAllDetails]);

  const { oldValue, newValue, activityEvent } = React.useMemo<ActivityFieldData>(() => {
    if (newState && !oldState)
      return { oldValue: '', newValue: newState, activityEvent: 'created' };

    if (!newState && oldState)
      return { oldValue: oldState, newValue: '', activityEvent: 'deleted' };

    return {
      oldValue: oldState || '',
      newValue: newState || '',
      activityEvent: 'updated',
    };
  }, [oldState, newState]);

  return (
    <Grid container flexDirection='column'>
      <ActivityFieldHeader
        startText={startText}
        activityName={activityName}
        eventType={activityEvent}
        showDetailsBtn
        detailsBtnOnClick={() => setIsDetailsOpen(!isDetailsOpen)}
        isDetailsOpen={isDetailsOpen}
      />
      <ActivityFieldState
        isDetailsOpen={isDetailsOpen}
        oldStateChildren={
          oldValue && <Typography variant='subtitle1'>{oldValue}</Typography>
        }
        newStateChildren={newValue && <Typography variant='body1'>{newValue}</Typography>}
      />
    </Grid>
  );
};
export default StringActivityField;
