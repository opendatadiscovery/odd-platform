import React from 'react';
import { Activity } from 'redux/interfaces';
import { Grid, Typography } from '@mui/material';
import EntityClassItem from 'components/shared/EntityClassItem/EntityClassItem';
import GearIcon from 'components/shared/Icons/GearIcon';
import UserIcon from 'components/shared/Icons/UserIcon';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { dataEntityDetailsPath } from 'lib/paths';
import { ActivityEventType } from 'generated-sources';
import OwnerActivityField from 'components/Activity/ActivityResults/ActivityResultByDate/ActivityItem/ActivityFields/OwnerActivityField/OwnerActivityField';
import * as S from './ActivityItemStyles';

interface ActivityItemProps {
  activity: Activity;
  hideAllDetails: boolean;
}

const ActivityItem: React.FC<ActivityItemProps> = ({
  activity,
  hideAllDetails,
}) => {
  const setActivityField = (eventType: ActivityEventType) => {
    let activityFieldComponent = null;

    switch (eventType) {
      case ActivityEventType.OWNERSHIP_CREATED:
        activityFieldComponent = <Grid>owner created </Grid>;
        break;
      case ActivityEventType.OWNERSHIP_UPDATED:
        activityFieldComponent = <Grid>owner updated </Grid>;
        break;
      case ActivityEventType.OWNERSHIP_DELETED:
        activityFieldComponent = <Grid>owner deleted </Grid>;
        break;
      case ActivityEventType.TAGS_ASSOCIATION_UPDATED:
        activityFieldComponent = <Grid>Tags uopdated </Grid>;
        break;
      default:
        activityFieldComponent = <Grid>defaulr</Grid>;
        break;
    }

    return <>{activityFieldComponent}</>;
  };

  // const getStateFieldName = (
  //   eventType: ActivityEventType
  // ): keyof ActivityState => {
  //   const { stateFieldName } = ActivityTypeStateFieldNameMap.get(
  //     activity.eventType
  //   )!;
  //   return stateFieldName;
  // };

  return (
    <S.Container container>
      <Grid container justifyContent="space-between" flexWrap="nowrap">
        <Grid item display="flex" flexWrap="nowrap" alignItems="center">
          <Link to={dataEntityDetailsPath(activity.dataEntity.id)}>
            <Typography variant="h3" sx={{ mr: 1 }}>
              {activity.dataEntity.internalName ||
                activity.dataEntity.externalName}
            </Typography>
          </Link>
          {activity.dataEntity.entityClasses?.map(entityClass => (
            <EntityClassItem
              key={entityClass.id}
              sx={{ mr: 0.5 }}
              entityClassName={entityClass.name}
            />
          ))}
        </Grid>
        <Grid
          item
          container
          flexWrap="nowrap"
          justifyContent="flex-end"
          alignItems="center"
        >
          {activity.systemEvent ? (
            <GearIcon />
          ) : (
            <Grid display="flex" flexWrap="nowrap" alignItems="center">
              <UserIcon stroke="black" />
              <Typography variant="body1" sx={{ ml: 0.5 }}>
                {activity.createdBy?.identity.username ||
                  activity.createdBy?.owner?.name}
              </Typography>
            </Grid>
          )}
          <Typography variant="subtitle1" sx={{ ml: 0.5 }}>
            at {format(activity.createdAt, 'p')}
          </Typography>
        </Grid>
      </Grid>
      {(activity.eventType === ActivityEventType.OWNERSHIP_CREATED ||
        activity.eventType === ActivityEventType.OWNERSHIP_UPDATED ||
        activity.eventType === ActivityEventType.OWNERSHIP_DELETED) && (
        <OwnerActivityField
          oldState={activity.oldState.ownerships}
          newState={activity.newState.ownerships}
          eventType={activity.eventType}
          hideAllDetails={hideAllDetails}
        />
      )}
    </S.Container>
  );
};
export default ActivityItem;
