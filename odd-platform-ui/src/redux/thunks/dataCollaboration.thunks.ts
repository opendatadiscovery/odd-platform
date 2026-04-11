import type {
  DataCollaborationApiGetSlackChannelsRequest,
  DataCollaborationApiPostMessageInSlackRequest,
  DataEntityApiGetChannelsRequest,
  DataEntityApiGetDataEntityMessagesRequest,
  DataEntityApiGetMessagesRequest,
  Message as GeneratedMessage,
  MessageChannel,
} from 'generated-sources';
import * as actions from 'redux/actions';
import type { Message, PageInfo } from 'redux/interfaces';
import { castDatesToTimestampInItemsArray, setPageInfo } from 'redux/lib/helpers';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';
import { dataCollaborationApi, dataEntityApi } from 'lib/api';

export const messagesListSize = 20;

export const fetchSlackChannels = handleResponseAsyncThunk<
  MessageChannel[],
  DataCollaborationApiGetSlackChannelsRequest
>(
  actions.fetchSlackChannelsActionType,
  async ({ channelName }) => {
    const { items } = await dataCollaborationApi.getSlackChannels({ channelName });

    return items;
  },
  {}
);

export const createMessageToSlack = handleResponseAsyncThunk<
  GeneratedMessage,
  DataCollaborationApiPostMessageInSlackRequest
>(
  actions.postMessageInSlackActionType,
  async ({ messageRequest }) =>
    await dataCollaborationApi.postMessageInSlack({ messageRequest }),
  {
    setSuccessOptions: ({ messageRequest }) => ({
      id: `Message-creating-${messageRequest.channelId}-${messageRequest.dataEntityId}`,
      message: `Message successfully created.`,
    }),
  }
);

export const fetchDataEntityChannels = handleResponseAsyncThunk<
  MessageChannel[],
  DataEntityApiGetChannelsRequest
>(
  actions.fetchDataEntityChannelsActionType,
  async ({ dataEntityId, channelName }) => {
    const { items } = await dataEntityApi.getChannels({ dataEntityId, channelName });

    return items;
  },
  {}
);

export const fetchDataEntityMessages = handleResponseAsyncThunk<
  { messages: Message[]; pageInfo: PageInfo<string> },
  DataEntityApiGetDataEntityMessagesRequest
>(
  actions.fetchDataEntityMessagesActionType,
  async params => {
    const { items } = await dataEntityApi.getDataEntityMessages(params);

    const messages = castDatesToTimestampInItemsArray<GeneratedMessage, Message>(items);
    const pageInfo = setPageInfo<Message>(messages, messagesListSize);

    return { messages, pageInfo };
  },
  {}
);

export const fetchRelatedMessages = handleResponseAsyncThunk<
  { messages: Message[]; pageInfo: PageInfo<string> },
  DataEntityApiGetMessagesRequest
>(
  actions.fetchMessagesRelatedToMessageActionType,
  async params => {
    const { items } = await dataEntityApi.getMessages(params);

    const messages = castDatesToTimestampInItemsArray<GeneratedMessage, Message>(items);
    const pageInfo = setPageInfo<Message>(messages, messagesListSize);

    return { messages, pageInfo };
  },
  {}
);
