import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'redux/interfaces';
import { createLegacyFetchingSelector } from 'redux/selectors/loader-selectors';
import { TagsState } from 'redux/interfaces/state';

const tagsState = ({ tags }: RootState): TagsState => tags;

const getTagsListFetchingStatus = createLegacyFetchingSelector('GET_TAGS');
export const getTagsCreateStatus =
  createLegacyFetchingSelector('POST_TAGS');
export const getTagUpdateStatus = createLegacyFetchingSelector('PUT_TAG');
export const deleteTagsUpdateStatus =
  createLegacyFetchingSelector('DELETE_TAG');

export const getIsTagsListFetching = createSelector(
  getTagsListFetchingStatus,
  status => status === 'fetching'
);

export const getTagsList = createSelector(tagsState, tags =>
  tags.allIds.map(id => tags.byId[id])
);

export const getIsTagCreating = createSelector(
  getTagsCreateStatus,
  status => status === 'fetching'
);

export const getIsTagUpdating = createSelector(
  getTagUpdateStatus,
  status => status === 'fetching'
);

export const getIsTagDeleting = createSelector(
  deleteTagsUpdateStatus,
  status => status === 'fetching'
);

export const getTagsListPage = createSelector(
  tagsState,
  tagsList => tagsList.pageInfo
);
