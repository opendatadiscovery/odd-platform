import React from 'react';
import { Grid, Typography } from '@mui/material';
import { GearIcon, UserIcon } from 'components/shared/Icons';
import { ActivityEventType } from 'generated-sources';
import { TagItem, LabelItem } from 'components/shared';
import {
  CustomGroupActivityField,
  EnumsActivityField,
  OwnerActivityField,
  StringActivityField,
  TermActivityField,
  ActivityFieldHeader,
  ArrayActivityField,
} from 'components/shared/Activity';
import { useAppDateTime } from 'lib/hooks';
import { type ActivityItemProps } from 'components/shared/Activity/common';
import * as S from './ActivityItemStyles';

const ActivityItem: React.FC<ActivityItemProps> = ({ activity, hideAllDetails }) => {
  const { activityFormattedDateTime } = useAppDateTime();

  const tagStateItem = React.useCallback(
    (name, important) => (
      <TagItem sx={{ backgroundColor: 'white' }} label={name} important={important} />
    ),
    []
  );

  const labelStateItem = React.useCallback(
    (name: string) => <LabelItem labelName={name} />,
    []
  );

  const isTypeRelatedTo = (types: ActivityEventType[]) =>
    types.includes(activity.eventType);

  return (
    <S.Container container>
      <Grid
        container
        justifyContent='space-between'
        alignItems='baseline'
        flexWrap='nowrap'
        position='relative'
      >
        {isTypeRelatedTo([
          ActivityEventType.OWNERSHIP_CREATED,
          ActivityEventType.OWNERSHIP_UPDATED,
          ActivityEventType.OWNERSHIP_DELETED,
        ]) && (
          <OwnerActivityField
            oldState={activity.oldState.ownerships}
            newState={activity.newState.ownerships}
            eventType={activity.eventType}
            hideAllDetails={hideAllDetails}
          />
        )}
        {isTypeRelatedTo([ActivityEventType.DATA_ENTITY_CREATED]) && (
          <ActivityFieldHeader
            eventType='created'
            startText='Data entity with'
            activityName={`ODDRN ${activity.newState.dataEntity?.oddrn}`}
          />
        )}
        {isTypeRelatedTo([ActivityEventType.DESCRIPTION_UPDATED]) && (
          <StringActivityField
            activityName='Description'
            oldState={activity.oldState.description?.description}
            newState={activity.newState.description?.description}
            hideAllDetails={hideAllDetails}
          />
        )}
        {isTypeRelatedTo([ActivityEventType.BUSINESS_NAME_UPDATED]) && (
          <StringActivityField
            activityName='Business name'
            oldState={activity.oldState.businessName?.internalName}
            newState={activity.newState.businessName?.internalName}
            hideAllDetails={hideAllDetails}
          />
        )}
        {isTypeRelatedTo([ActivityEventType.DATASET_FIELD_DESCRIPTION_UPDATED]) && (
          <StringActivityField
            activityName={`Dataset field ${activity.oldState.datasetFieldInformation?.name} description`}
            oldState={activity.oldState.datasetFieldInformation?.description}
            newState={activity.newState.datasetFieldInformation?.description}
            hideAllDetails={hideAllDetails}
          />
        )}
        {isTypeRelatedTo([ActivityEventType.TAGS_ASSOCIATION_UPDATED]) && (
          <ArrayActivityField
            activityName='Tags'
            oldState={activity.oldState.tags}
            newState={activity.newState.tags}
            hideAllDetails={hideAllDetails}
            stateItem={tagStateItem}
            plural
          />
        )}
        {isTypeRelatedTo([ActivityEventType.DATASET_FIELD_LABELS_UPDATED]) && (
          <ArrayActivityField
            activityName={`Labels in ${activity.oldState.datasetFieldInformation?.name} column`}
            oldState={activity.oldState.datasetFieldInformation?.labels}
            newState={activity.newState.datasetFieldInformation?.labels}
            hideAllDetails={hideAllDetails}
            stateItem={labelStateItem}
            plural
          />
        )}
        {isTypeRelatedTo([ActivityEventType.TERM_ASSIGNED]) && (
          <TermActivityField
            oldState={activity.oldState.terms}
            newState={activity.newState.terms}
            hideAllDetails={hideAllDetails}
            eventType='assigned'
            stateDirection='column'
          />
        )}
        {isTypeRelatedTo([ActivityEventType.TERM_ASSIGNMENT_DELETED]) && (
          <TermActivityField
            oldState={activity.oldState.terms}
            newState={activity.newState.terms}
            hideAllDetails={hideAllDetails}
            eventType='deleted'
            stateDirection='column'
          />
        )}
        {isTypeRelatedTo([ActivityEventType.DATASET_FIELD_VALUES_UPDATED]) && (
          <EnumsActivityField
            oldState={activity.oldState.datasetFieldValues}
            newState={activity.newState.datasetFieldValues}
            hideAllDetails={hideAllDetails}
          />
        )}
        {isTypeRelatedTo([ActivityEventType.CUSTOM_GROUP_CREATED]) && (
          <ActivityFieldHeader
            eventType='created'
            startText='Custom group'
            activityName={`${activity.dataEntity.internalName}`}
          />
        )}
        {isTypeRelatedTo([ActivityEventType.CUSTOM_GROUP_DELETED]) && (
          <ActivityFieldHeader
            eventType='deleted'
            startText='Custom group'
            activityName={`${activity.dataEntity.internalName}`}
          />
        )}
        {isTypeRelatedTo([ActivityEventType.CUSTOM_GROUP_UPDATED]) && (
          <CustomGroupActivityField
            oldState={activity.oldState.customGroup}
            newState={activity.newState.customGroup}
            hideAllDetails={hideAllDetails}
          />
        )}
        <Grid
          item
          container
          flexWrap='nowrap'
          justifyContent='flex-end'
          alignItems='center'
          sx={{ position: 'absolute', top: '8px', right: 0, zIndex: -1 }}
        >
          {activity.systemEvent ? (
            <GearIcon />
          ) : (
            <Grid display='flex' flexWrap='nowrap' alignItems='center'>
              <UserIcon stroke='black' />
              <Typography variant='body1' sx={{ ml: 0.5 }}>
                {activity.createdBy?.owner?.name || activity.createdBy?.identity.username}
              </Typography>
            </Grid>
          )}
          <Typography variant='subtitle1' sx={{ ml: 0.5 }}>
            at {activityFormattedDateTime(activity.createdAt)}
          </Typography>
        </Grid>
      </Grid>
    </S.Container>
  );
};
export default ActivityItem;
