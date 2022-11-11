import React from 'react';
import { Grid, Typography } from '@mui/material';
import { type CRUDType } from 'lib/interfaces';
import ActivityFieldHeader from '../ActivityFieldHeader/ActivityFieldHeader';
import ActivityFieldState from '../ActivityFieldState/ActivityFieldState';

interface ActivityFieldData {
  oldValue: string;
  newValue: string;
  activityEvent: CRUDType;
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

  const [{ oldValue, newValue, showDetails, activityEvent }, setFieldData] =
    React.useState<ActivityFieldData>({
      oldValue: '',
      newValue: '',
      activityEvent: 'created',
      showDetails: false,
    });

  React.useEffect(() => {
    if (newState && (oldState === undefined || oldState.length === 0)) {
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
    <Grid container flexDirection='column'>
      <ActivityFieldHeader
        startText=''
        activityName={activityName}
        eventType={activityEvent}
        showDetailsBtn={showDetails}
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
