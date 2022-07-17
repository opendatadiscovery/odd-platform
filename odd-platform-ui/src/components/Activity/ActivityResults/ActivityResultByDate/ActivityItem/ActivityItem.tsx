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
import ArrayActivityField from 'components/Activity/ActivityResults/ActivityResultByDate/ActivityItem/ActivityFields/ArrayActivityField/ArrayActivityField';
import TagItem from 'components/shared/TagItem/TagItem';
import LabelItem from 'components/shared/LabelItem/LabelItem';
import TermActivityField from 'components/Activity/ActivityResults/ActivityResultByDate/ActivityItem/ActivityFields/TermActivityField/TermActivityField';
import EnumsActivityField from 'components/Activity/ActivityResults/ActivityResultByDate/ActivityItem/ActivityFields/EnumsActivityField/EnumsActivityField';
import * as S from './ActivityItemStyles';

interface ActivityItemProps {
  activity: Activity;
  hideAllDetails: boolean;
}

const ActivityItem: React.FC<ActivityItemProps> = ({
  activity,
  hideAllDetails,
}) => {
  const tagStateItem = React.useCallback(
    (name, _, important) => (
      <TagItem
        sx={{ backgroundColor: 'white' }}
        label={name}
        important={important}
      />
    ),
    []
  );

  const labelStateItem = React.useCallback(
    (name: string) => <LabelItem labelName={name} />,
    []
  );

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
      {activity.eventType ===
        ActivityEventType.DATASET_FIELD_DESCRIPTION_UPDATED && (
        <StringActivityField
          activityName={`Dataset field ${activity.oldState.datasetFieldInformation?.name} description`}
          oldState={activity.oldState.datasetFieldInformation?.description}
          newState={activity.newState.datasetFieldInformation?.description}
          hideAllDetails={hideAllDetails}
        />
      )}
      {activity.eventType ===
        ActivityEventType.TAGS_ASSOCIATION_UPDATED && (
        <ArrayActivityField
          activityName="Tags"
          oldState={activity.oldState.tags}
          newState={activity.newState.tags}
          hideAllDetails={hideAllDetails}
          stateItem={tagStateItem}
        />
      )}
      {activity.eventType ===
        ActivityEventType.DATASET_FIELD_LABELS_UPDATED && (
        <ArrayActivityField
          activityName={`Labels in ${activity.oldState.datasetFieldInformation?.name} column`}
          oldState={activity.oldState.datasetFieldInformation?.labels}
          newState={activity.newState.datasetFieldInformation?.labels}
          hideAllDetails={hideAllDetails}
          stateItem={labelStateItem}
        />
      )}
      {activity.eventType === ActivityEventType.TERM_ASSIGNED && (
        <TermActivityField
          oldState={activity.oldState.terms}
          newState={activity.newState.terms}
          hideAllDetails={hideAllDetails}
          eventType="added"
          stateDirection="column"
        />
      )}
      {activity.eventType ===
        ActivityEventType.TERM_ASSIGNMENT_DELETED && (
        <TermActivityField
          oldState={activity.oldState.terms}
          newState={activity.newState.terms}
          hideAllDetails={hideAllDetails}
          eventType="deleted"
          stateDirection="column"
        />
      )}
      {activity.eventType ===
        ActivityEventType.DATASET_FIELD_VALUES_UPDATED && (
        <EnumsActivityField
          oldState={activity.oldState.datasetFieldValues}
          newState={activity.newState.datasetFieldValues}
          hideAllDetails={hideAllDetails}
          stateDirection="column"
        />
      )}
    </S.Container>
  );
};
export default ActivityItem;
