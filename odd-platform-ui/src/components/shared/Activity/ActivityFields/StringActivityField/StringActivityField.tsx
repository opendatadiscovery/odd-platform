import React from 'react';
import { Grid, Typography } from '@mui/material';
import ActivityFieldHeader from 'components/shared/Activity/ActivityFields/ActivityFieldHeader/ActivityFieldHeader';
import ActivityFieldState from 'components/shared/Activity/ActivityFields/ActivityFieldState/ActivityFieldState';

interface ActivityFieldData {
  oldValue: string;
  newValue: string;
  activityEvent: 'created' | 'updated' | 'deleted';
  showDetails: boolean;
}

interface StringActivityFieldProps {
  oldState: string | undefined;
  newState: string | undefined;
  hideAllDetails: boolean;
  activityName: string;
}

const StringActivityField: React.FC<StringActivityFieldProps> = ({
  oldState,
  newState,
  hideAllDetails,
  activityName,
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);

  React.useEffect(() => setIsDetailsOpen(false), [hideAllDetails]);

  const [
    { oldValue, newValue, showDetails, activityEvent },
    setFieldData,
  ] = React.useState<ActivityFieldData>({
    oldValue: '',
    newValue: '',
    activityEvent: 'created',
    showDetails: false,
  });

  React.useEffect(() => {
    if (newState && oldState === undefined) {
      setFieldData({
        oldValue: '',
        newValue: newState,
        activityEvent: 'created',
        showDetails: true,
      });
    }

    if (newState && oldState) {
      setFieldData({
        oldValue: oldState,
        newValue: newState,
        activityEvent: 'updated',
        showDetails: true,
      });
    }

    if (!newState && oldState) {
      setFieldData({
        oldValue: oldState,
        newValue: '',
        activityEvent: 'deleted',
        showDetails: true,
      });
    }
  }, [oldState, newState]);

  return (
    <Grid container flexDirection="column">
      <ActivityFieldHeader
        startText=""
        activityName={activityName}
        eventType={activityEvent}
        showDetailsBtn={showDetails}
        detailsBtnOnClick={() => setIsDetailsOpen(!isDetailsOpen)}
        isDetailsOpen={isDetailsOpen}
      />
      <ActivityFieldState
        isDetailsOpen={isDetailsOpen}
        oldStateChildren={
          oldValue && (
            <Typography variant="subtitle1">{oldValue}</Typography>
          )
        }
        newStateChildren={
          newValue && <Typography variant="body1">{newValue}</Typography>
        }
      />
    </Grid>
  );
};
export default StringActivityField;
