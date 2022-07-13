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
import ActivityFieldHeader from 'components/shared/Activity/ActivityField/ActivityFieldHeader/ActivityFieldHeader';
import StringActivityField from 'components/Activity/ActivityResults/ActivityResultByDate/ActivityItem/ActivityFields/StringActivityField/StringActivityField';
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
            <Typography variant="h3" sx={{ mr: 1, width: 'max-content' }}>
              {activity.dataEntity.externalName}
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
      {activity.eventType === ActivityEventType.DATA_ENTITY_CREATED && (
        <ActivityFieldHeader
          eventType="created"
          startText="Data entity with"
          activityName={`ODDRN ${activity.newState.dataEntity?.oddrn}`}
        />
      )}
      {activity.eventType === ActivityEventType.DESCRIPTION_UPDATED && (
        <StringActivityField
          activityName="Description"
          oldState={activity.oldState.description?.description}
          newState={activity.newState.description?.description}
          hideAllDetails={hideAllDetails}
        />
      )}
      {activity.eventType === ActivityEventType.CUSTOM_NAME_UPDATED && (
        <StringActivityField
          activityName="Custom name"
          oldState={activity.oldState.customName?.internalName}
          newState={activity.newState.customName?.internalName}
          hideAllDetails={hideAllDetails}
        />
      )}
      {/* {activity.eventType === */}
      {/*  ActivityEventType.DATASET_FIELD_INFORMATION_UPDATED && */}
      {/*  activity.oldState.datasetFieldInformation?.description && ( */}
      {/*    <StringActivityField */}
      {/*      activityName={`Dataset field ${activity.oldState.datasetFieldInformation?.name} description`} */}
      {/*      oldState={ */}
      {/*        activity.oldState.datasetFieldInformation?.description */}
      {/*      } */}
      {/*      newState={ */}
      {/*        activity.newState.datasetFieldInformation?.description */}
      {/*      } */}
      {/*      hideAllDetails={hideAllDetails} */}
      {/*    /> */}
      {/*  )} */}
      {/* {activity.eventType === */}
      {/*  ActivityEventType.TAGS_ASSOCIATION_UPDATED && ( */}
      {/*  <ArrayActivityField */}
      {/*    activityName="Tags" */}
      {/*    oldState={activity.oldState.tags} */}
      {/*    newState={activity.newState.tags} */}
      {/*    hideAllDetails={hideAllDetails} */}
      {/*    stateItem={(name, important) => ( */}
      {/*      <TagItem */}
      {/*        sx={{ width: 'max-content', backgroundColor: 'white' }} */}
      {/*        label={name} */}
      {/*        important={important} */}
      {/*      /> */}
      {/*    )} */}
      {/*  /> */}
      {/* )} */}
      {/* {activity.eventType === */}
      {/*  ActivityEventType.DATASET_FIELD_INFORMATION_UPDATED && */}
      {/*  activity.oldState.datasetFieldInformation?.labels && ( */}
      {/*    <ArrayActivityField */}
      {/*      activityName={`Dataset field ${activity.oldState.datasetFieldInformation?.name} labels`} */}
      {/*      oldState={activity.oldState.datasetFieldInformation?.labels} */}
      {/*      newState={activity.newState.datasetFieldInformation?.labels} */}
      {/*      hideAllDetails={hideAllDetails} */}
      {/*      stateItem={(labelName: string) => ( */}
      {/*        <LabelItem */}
      {/*          // sx={{ width: 'max-content', backgroundColor: 'white' }} */}
      {/*          labelName={labelName} */}
      {/*        /> */}
      {/*      )} */}
      {/*    /> */}
      {/*  )} */}
      {/* {activity.eventType === ActivityEventType.TERM_ASSIGNED && ( */}
      {/*  <ArrayActivityField */}
      {/*    activityName="Term" */}
      {/*    oldState={activity.oldState.terms} */}
      {/*    newState={activity.newState.terms} */}
      {/*    hideAllDetails={hideAllDetails} */}
      {/*    eventType="added" */}
      {/*    stateItem={(labelName: string) => ( */}
      {/*      <div>{labelName}</div> */}
      {/*      // <LabelItem */}
      {/*      //   // sx={{ width: 'max-content', backgroundColor: 'white' }} */}
      {/*      //   labelName={labelName} */}
      {/*      // /> */}
      {/*    )} */}
      {/* /> */}
      {/* )} */}
      {/* {activity.eventType === */}
      {/*  ActivityEventType.TERM_ASSIGNMENT_DELETED && ( */}
      {/*  <ArrayActivityField */}
      {/*    activityName="Term" */}
      {/*    oldState={activity.oldState.terms} */}
      {/*    newState={activity.newState.terms} */}
      {/*    hideAllDetails={hideAllDetails} */}
      {/*    eventType="deleted" */}
      {/*    stateItem={(labelName: string) => ( */}
      {/*      <div>{labelName}</div> */}
      {/*      // <LabelItem */}
      {/*      //   // sx={{ width: 'max-content', backgroundColor: 'white' }} */}
      {/*      //   labelName={labelName} */}
      {/*      // /> */}
      {/*    )} */}
      {/*  /> */}
      {/* )} */}
    </S.Container>
  );
};
export default ActivityItem;
