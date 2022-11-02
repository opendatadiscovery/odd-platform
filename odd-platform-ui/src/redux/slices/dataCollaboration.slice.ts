import { dataCollaborationActTypePrefix } from 'redux/actions';
import { createSlice } from '@reduxjs/toolkit';
import * as thunks from 'redux/thunks';
import { DataCollaborationState, Message } from 'redux/interfaces';
import { formattedDate } from 'lib/helpers';

export const initialState: DataCollaborationState = {
  channels: [],
  messages: { messagesByDate: {}, pageInfo: { hasNext: true } },
  relatedMessages: { messages: [], pageInfo: { hasNext: true } },
};

export const dataCollaborationSlice = createSlice({
  name: dataCollaborationActTypePrefix,
  initialState,
  reducers: { clearCollaborationState: () => initialState },
  extraReducers: builder => {
    builder.addCase(thunks.fetchDataEntityChannels.fulfilled, (state, { payload }) => {
      state.channels = payload;
    });

    builder.addCase(thunks.fetchDataEntityMessages.fulfilled, (state, { payload }) => {
      const { messages, pageInfo } = payload;
      const dateFormat = 'MMMM dd, yyyy';

      state.messages = messages.reduce(
        (memo: DataCollaborationState['messages'], message: Message) => ({
          ...memo,
          messagesByDate: {
            ...memo.messagesByDate,
            [formattedDate(message.createdAt, dateFormat)]: [
              ...(memo.messagesByDate[formattedDate(message.createdAt, dateFormat)] ||
                []),
              message,
            ],
          },
        }),
        { ...state.messages, pageInfo }
      );

      return state;
    });

    builder.addCase(
      thunks.fetchMessagesRelatedToMessage.fulfilled,
      (state, { payload }) => {
        state.relatedMessages = payload;

        return state;
      }
    );
  },
});

export const { clearCollaborationState } = dataCollaborationSlice.actions;

export default dataCollaborationSlice.reducer;
