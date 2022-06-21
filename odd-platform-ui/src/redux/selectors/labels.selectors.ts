import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'redux/interfaces';
import { labelsAdapter } from 'redux/reducers/labels.slice';
import { createStatusesSelector } from 'redux/selectors/loader-selectors';
import { LabelsState } from 'redux/interfaces/state';
import * as actions from 'redux/actions';

const labelsState = ({ labels }: RootState): LabelsState => labels;

export const { selectAll: getLabelsList } =
  labelsAdapter.getSelectors<RootState>(state => state.labels);

export const getLabelListFetchingStatuses = createStatusesSelector(
  actions.fetchLabelsAction
);

export const getLabelCreatingStatuses = createStatusesSelector(
  actions.createLabelsAction
);

export const getLabelUpdatingStatuses = createStatusesSelector(
  actions.updateLabelAction
);

export const getLabelDeletingStatuses = createStatusesSelector(
  actions.deleteLabelAction
);

export const getLabelsListPage = createSelector(
  labelsState,
  labelsList => labelsList.pageInfo
);
