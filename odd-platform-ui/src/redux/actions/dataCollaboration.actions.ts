import { createActionType } from 'redux/lib/helpers';

export const dataCollaborationActTypePrefix = 'dataCollaboration';

export const fetchSlackChannelsActionType = createActionType(
  dataCollaborationActTypePrefix,
  'fetchSlackChannels'
);

export const postMessageInSlackActionType = createActionType(
  dataCollaborationActTypePrefix,
  'postMessageInSlack'
);

export const fetchDataEntityChannelsActionType = createActionType(
  dataCollaborationActTypePrefix,
  'fetchDataEntityChannels'
);

export const fetchDataEntityMessagesActionType = createActionType(
  dataCollaborationActTypePrefix,
  'fetchDataEntityMessages'
);

export const fetchMessagesRelatedToMessageActionType = createActionType(
  dataCollaborationActTypePrefix,
  'fetchMessagesRelatedToMessage'
);
