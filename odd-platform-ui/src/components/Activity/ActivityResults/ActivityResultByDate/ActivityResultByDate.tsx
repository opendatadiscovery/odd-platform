import React from 'react';
import { Activity } from 'redux/interfaces';
import { Grid, Typography } from '@mui/material';
import ActivityItem from 'components/Activity/ActivityResults/ActivityResultByDate/ActivityItem/ActivityItem';

interface ActivityResultByDateProps {
  activityDate: string;
  activities: Activity[];
  hideAllDetails: boolean;
}

const ActivityResultByDate: React.FC<ActivityResultByDateProps> = ({
  activityDate,
  activities,
  hideAllDetails,
}) => {
  const hideAllActivitiesHandler = () => {};

  return (
    <Grid container>
      <Typography variant="subtitle2" sx={{ py: 1 }}>
        {activityDate}
      </Typography>
      {activities.map(activity => (
        <ActivityItem
          key={activity.id}
          activity={activity}
          hideAllDetails={hideAllDetails}
        />
      ))}
    </Grid>
  );
};
export default ActivityResultByDate;
