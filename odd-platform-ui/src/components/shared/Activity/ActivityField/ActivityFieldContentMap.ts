import { ActivityEventType } from 'generated-sources';

export interface ActivityFieldContent {
  startText: string;
  activityName: string;
  contentEventType: 'created' | 'updated' | 'deleted';
}

export const ActivityFieldContentMap: Map<
  ActivityEventType,
  ActivityFieldContent
> = new Map([
  [
    ActivityEventType.OWNERSHIP_CREATED,
    {
      startText: 'Owner',
      activityName: '',
      contentEventType: 'created',
    },
  ],
  [
    ActivityEventType.OWNERSHIP_UPDATED,
    {
      startText: 'Owner',
      activityName: 'role',
      contentEventType: 'updated',
    },
  ],
  [
    ActivityEventType.OWNERSHIP_DELETED,
    {
      startText: 'Owner',
      activityName: '',
      contentEventType: 'deleted',
    },
  ],
  // [ActivityEventType.TAGS_ASSOCIATION_UPDATED, { stateFieldName: 'tags' }],
  // [
  //   ActivityEventType.DATA_ENTITY_CREATED,
  //   { stateFieldName: 'dataEntity' },
  // ],
  // [ActivityEventType.TERM_ASSIGNED, { stateFieldName: 'terms' }],
  // [ActivityEventType.TERM_ASSIGNMENT_DELETED, { stateFieldName: 'terms' }],
  // [
  //   ActivityEventType.DESCRIPTION_UPDATED,
  //   { stateFieldName: 'description' },
  // ],
  // [
  //   ActivityEventType.CUSTOM_NAME_UPDATED,
  //   { stateFieldName: 'customName' },
  // ],
  // [
  //   ActivityEventType.CUSTOM_METADATA_CREATED,
  //   { stateFieldName: 'customMetadata' },
  // ],
  // [
  //   ActivityEventType.CUSTOM_METADATA_UPDATED,
  //   { stateFieldName: 'customMetadata' },
  // ],
  // [
  //   ActivityEventType.CUSTOM_METADATA_DELETED,
  //   { stateFieldName: 'customMetadata' },
  // ],
  // [
  //   ActivityEventType.DATASET_FIELD_VALUES_UPDATED,
  //   { stateFieldName: 'datasetFieldValues' },
  // ],
  // [
  //   ActivityEventType.DATASET_FIELD_INFORMATION_UPDATED,
  //   { stateFieldName: 'datasetFieldInformation' },
  // ],
  // [
  //   ActivityEventType.CUSTOM_GROUP_CREATED,
  //   { stateFieldName: 'customGroup' },
  // ],
  // [
  //   ActivityEventType.CUSTOM_GROUP_UPDATED,
  //   { stateFieldName: 'customGroup' },
  // ],
  // [
  //   ActivityEventType.CUSTOM_GROUP_DELETED,
  //   { stateFieldName: 'customGroup' },
  // ],
]);

export const useActivityContent = (
  eventType: ActivityEventType
): ActivityFieldContent => {
  const content = ActivityFieldContentMap.get(eventType);

  if (content) {
    return {
      activityName: content.activityName,
      startText: content.startText,
      contentEventType: content.contentEventType,
    };
  }

  return { activityName: '', startText: '', contentEventType: 'created' };
};
