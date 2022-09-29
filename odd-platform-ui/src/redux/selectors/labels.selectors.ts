import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'redux/interfaces';
import { labelsAdapter } from 'redux/slices/labels.slice';
import { createStatusesSelector } from 'redux/selectors/loader-selectors';
import { LabelsState } from 'redux/interfaces/state';
import * as actions from 'redux/actions';

const labelsState = ({ labels }: RootState): LabelsState => labels;

export const { selectAll: getLabelsList } = labelsAdapter.getSelectors<RootState>(
  state => state.labels
);

export const getLabelListFetchingStatuses = createStatusesSelector(
  actions.fetchLabelsActionType
);

export const getLabelCreatingStatuses = createStatusesSelector(
  actions.createLabelsActionType
);

export const getLabelUpdatingStatuses = createStatusesSelector(
  actions.updateLabelActionType
);

export const getLabelDeletingStatuses = createStatusesSelector(
  actions.deleteLabelActionType
);

export const getLabelsListPage = createSelector(
  labelsState,
  labelsList => labelsList.pageInfo
);
