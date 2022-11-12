import { dataCollaborationActTypePrefix } from 'redux/actions';
import { createSlice } from '@reduxjs/toolkit';
import * as thunks from 'redux/thunks';
import type { DataCollaborationState, Message } from 'redux/interfaces';
import { formatDate } from 'lib/helpers';
import uniqBy from 'lodash/uniqBy';
import { datedListFormat } from 'lib/constants';

export const initialState: DataCollaborationState = {
  messages: { messagesByDate: {}, pageInfo: { hasNext: true } },
  relatedMessages: { messages: [], pageInfo: { hasNext: true } },
};

export const dataCollaborationSlice = createSlice({
  name: dataCollaborationActTypePrefix,
  initialState,
  reducers: { clearCollaborationState: () => initialState },
  extraReducers: builder => {
    builder.addCase(thunks.fetchDataEntityMessages.fulfilled, (state, { payload }) => {
      const { messages, pageInfo } = payload;

      state.messages = messages.reduce(
        (memo: DataCollaborationState['messages'], message: Message) => ({
          ...memo,
          messagesByDate: {
            ...memo.messagesByDate,
            [formatDate(message.createdAt, datedListFormat)]: uniqBy(
              [
                ...(memo.messagesByDate[formatDate(message.createdAt, datedListFormat)] ||
                  []),
                message,
              ],
              'id'
            ),
          },
        }),
        { ...state.messages, pageInfo }
      );

      return state;
    });

    builder.addCase(thunks.fetchRelatedMessages.fulfilled, (state, { payload }) => {
      state.relatedMessages = payload;

      return state;
    });
  },
});

export const { clearCollaborationState } = dataCollaborationSlice.actions;

export default dataCollaborationSlice.reducer;
