import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'redux/interfaces';
import { createLegacyFetchingSelector } from 'redux/selectors/loader-selectors';
import { LabelsState } from 'redux/interfaces/state';

const labelsState = ({ labels }: RootState): LabelsState => labels;

const getLabelsListFetchingStatus =
  createLegacyFetchingSelector('GET_LABELS');
export const getLabelsCreateStatus =
  createLegacyFetchingSelector('POST_LABELS');
export const getLabelUpdateStatus =
  createLegacyFetchingSelector('PUT_LABEL');
export const deleteLabelsUpdateStatus =
  createLegacyFetchingSelector('DELETE_LABEL');

export const getIsLabelsListFetching = createSelector(
  getLabelsListFetchingStatus,
  status => status === 'fetching'
);

export const getLabelsList = createSelector(labelsState, labels =>
  labels.allIds.map(id => labels.byId[id])
);

export const getIsLabelCreating = createSelector(
  getLabelsCreateStatus,
  status => status === 'fetching'
);

export const getIsLabelUpdating = createSelector(
  getLabelUpdateStatus,
  status => status === 'fetching'
);

export const getIsLabelDeleting = createSelector(
  deleteLabelsUpdateStatus,
  status => status === 'fetching'
);

export const getLabelsListPage = createSelector(
  labelsState,
  labelsList => labelsList.pageInfo
);
