import { createSelector } from '@reduxjs/toolkit';
import { DataCollaborationState, Message, RootState } from 'redux/interfaces';
import { createStatusesSelector } from 'redux/selectors/loader-selectors';
import * as actions from 'redux/actions';
import { emptyArr, emptyObj } from 'lib/constants';

const dataCollaborationState = ({
  dataCollaboration,
}: RootState): DataCollaborationState => dataCollaboration;

export const getSlackChannelsFetchingStatuses = createStatusesSelector(
  actions.fetchSlackChannelsActionType
);

export const getMessageToSlackCreatingStatuses = createStatusesSelector(
  actions.postMessageInSlackActionType
);

export const getDataEntityChannelsFetchingStatuses = createStatusesSelector(
  actions.fetchDataEntityChannelsActionType
);

export const getDataEntityMessagesFetchingStatuses = createStatusesSelector(
  actions.fetchDataEntityMessagesActionType
);

export const getRelatedMessagesFetchingStatuses = createStatusesSelector(
  actions.fetchMessagesRelatedToMessageActionType
);

export const getDataEntityChannels = createSelector(
  dataCollaborationState,
  dataCollaboration => dataCollaboration.channels
);

export const getDataEntityMessages = createSelector(
  dataCollaborationState,
  dataCollaboration => dataCollaboration.messages.messagesByDate
);

export const getDataEntityMessage = (messageDate: string, messageId: number) =>
  createSelector(
    dataCollaborationState,
    dataCollaboration =>
      dataCollaboration.messages.messagesByDate[messageDate]?.find(
        message => message.id === messageId
      ) || (emptyObj as Message)
  );

export const getDataEntityMessagesPageInfo = createSelector(
  dataCollaborationState,
  dataCollaboration => dataCollaboration.messages.pageInfo
);

export const getLengthOfDataEntityMessages = createSelector(
  dataCollaborationState,
  dataCollaboration =>
    Object.entries(dataCollaboration.messages.messagesByDate)
      .map(([_, messagesList]) => messagesList.length)
      .reduce((acc, val) => acc + val, 0)
);

export const getRelatedMessages = createSelector(
  dataCollaborationState,
  dataCollaboration => dataCollaboration.relatedMessages.messages || emptyArr
);

export const getRelatedMessagesPageInfo = createSelector(
  dataCollaborationState,
  dataCollaboration => dataCollaboration.relatedMessages.pageInfo
);
