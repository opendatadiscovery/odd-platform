import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'redux/interfaces';
import {
  createLegacyFetchingSelector,
  createStatusesSelector,
} from 'redux/selectors/loader-selectors';
import { TagsState } from 'redux/interfaces/state';
import { tagsAdapter } from 'redux/reducers/tags.slice';
import * as actions from 'redux/actions';

export const tagsState = ({ tags }: RootState): TagsState => tags;

const getTagsListFetchingStatus = createLegacyFetchingSelector('GET_TAGS');

export const getTagsListFetchingStatuses = createStatusesSelector(
  actions.fetchTagsActionType
);

export const getTagCreatingStatuses = createStatusesSelector(
  actions.createTagsActionType
);

export const getTagUpdatingStatuses = createStatusesSelector(
  actions.updateTagActionType
);

export const getTAgDeletingStatuses = createStatusesSelector(
  actions.deleteTagActionType
);

export const { selectAll: getTagsList, selectById: getTagById } =
  tagsAdapter.getSelectors<RootState>(state => state.tags);

export const getIsTagsListFetching = createSelector(
  getTagsListFetchingStatus,
  status => status === 'fetching'
);

export const getTagsListPage = createSelector(
  tagsState,
  tagsList => tagsList.pageInfo
);
