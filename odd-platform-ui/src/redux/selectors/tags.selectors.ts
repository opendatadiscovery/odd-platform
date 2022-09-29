import { createSelector } from '@reduxjs/toolkit';
import { createStatusesSelector } from 'redux/selectors';
import { RootState, TagsState } from 'redux/interfaces';
import { tagsAdapter } from 'redux/slices/tags.slice';
import * as actions from 'redux/actions';

export const tagsState = ({ tags }: RootState): TagsState => tags;

export const getTagListFetchingStatuses = createStatusesSelector(
  actions.fetchTagsActType
);
export const getTagCreatingStatuses = createStatusesSelector(actions.createTagsActType);
export const getTagUpdatingStatuses = createStatusesSelector(actions.updateTagActType);
export const getTagDeletingStatuses = createStatusesSelector(actions.deleteTagActType);

export const { selectAll: getTagsList } = tagsAdapter.getSelectors<RootState>(
  state => state.tags
);

export const getTagsListPage = createSelector(tagsState, tagsList => tagsList.pageInfo);
