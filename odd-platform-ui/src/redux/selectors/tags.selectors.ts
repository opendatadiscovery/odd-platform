import { createSelector } from '@reduxjs/toolkit';
import { createStatusesSelector } from 'redux/selectors';
import { RootState, TagsState } from 'redux/interfaces';
import { tagsAdapter } from 'redux/slices/tags.slice';
import * as actions from 'redux/actions';

export const tagsState = ({ tags }: RootState): TagsState => tags;

export const getTagsListFetchingStatuses = createStatusesSelector(
  actions.fetchTagsActionType
);

export const getTagCreatingStatuses = createStatusesSelector(
  actions.createTagsActionType
);

export const getTagUpdatingStatuses = createStatusesSelector(
  actions.updateTagActionType
);

export const getTagDeletingStatuses = createStatusesSelector(
  actions.deleteTagActionType
);

export const { selectAll: getTagsList } =
  tagsAdapter.getSelectors<RootState>(state => state.tags);

export const getTagsListPage = createSelector(
  tagsState,
  tagsList => tagsList.pageInfo
);
