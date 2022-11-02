import {
  Configuration,
  DataCollaborationApi,
  DataCollaborationApiGetSlackChannelsRequest,
  DataCollaborationApiPostMessageInSlackRequest,
  DataEntityApi,
  DataEntityApiGetChannelsRequest,
  Message as GeneratedMessage,
  MessageChannel,
} from 'generated-sources';
import { createAsyncThunk } from '@reduxjs/toolkit';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import {
  DataEntityApiGetDataEntityMessagesRequest,
  DataEntityApiGetRelatedMessagesRequest,
  Message,
  PageInfo,
} from 'redux/interfaces';
import { castDatesToTimestampInItemsArray, setPageInfo } from 'redux/lib/helpers';

const apiClientConf = new Configuration(BASE_PARAMS);
const dataCollaborationApi = new DataCollaborationApi(apiClientConf);
const dataEntityApi = new DataEntityApi(apiClientConf);

export const messagesListSize = 20;

export const fetchSlackChannels = createAsyncThunk<
  MessageChannel[],
  DataCollaborationApiGetSlackChannelsRequest
>(actions.fetchSlackChannelsActionType, async ({ channelName }) => {
  const { items } = await dataCollaborationApi.getSlackChannels({ channelName });

  return items;
});

export const createMessageToSlack = createAsyncThunk<
  GeneratedMessage,
  DataCollaborationApiPostMessageInSlackRequest
>(actions.postMessageInSlackActionType, async ({ messageRequest }) =>
  dataCollaborationApi.postMessageInSlack({ messageRequest })
);

export const fetchDataEntityChannels = createAsyncThunk<
  MessageChannel[],
  DataEntityApiGetChannelsRequest
>(actions.fetchDataEntityChannelsActionType, async ({ dataEntityId, channelName }) => {
  const { items } = await dataEntityApi.getChannels({ dataEntityId, channelName });

  return items;
});

export const fetchDataEntityMessages = createAsyncThunk<
  { messages: Message[]; pageInfo: PageInfo },
  DataEntityApiGetDataEntityMessagesRequest
>(actions.fetchDataEntityMessagesActionType, async params => {
  const castedMessageDateTime = params.lastMessageDateTime
    ? new Date(params.lastMessageDateTime)
    : undefined;

  const reqParams = { ...params, lastMessageDateTime: castedMessageDateTime };

  const { items } = await dataEntityApi.getDataEntityMessages(reqParams);

  const messages = castDatesToTimestampInItemsArray<GeneratedMessage, Message>(items);
  const pageInfo = setPageInfo<Message>(messages, messagesListSize);

  return { messages, pageInfo };
});

export const fetchRelatedMessages = createAsyncThunk<
  { messages: Message[]; pageInfo: PageInfo },
  DataEntityApiGetRelatedMessagesRequest
>(actions.fetchMessagesRelatedToMessageActionType, async params => {
  const castedMessageDateTime = params.lastMessageDateTime
    ? new Date(params.lastMessageDateTime)
    : undefined;

  const reqParams = { ...params, lastMessageDateTime: castedMessageDateTime };

  const { items } = await dataEntityApi.getMessages(reqParams);

  const messages = castDatesToTimestampInItemsArray<GeneratedMessage, Message>(items);
  const pageInfo = setPageInfo<Message>(messages, messagesListSize);

  return { messages, pageInfo };
});
