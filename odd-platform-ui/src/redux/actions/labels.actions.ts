import { createActionType } from 'lib/redux/helpers';

export const labelsActionPrefix = 'labels';

export const fetchLabelsAction = createActionType(
  labelsActionPrefix,
  'fetchLabels'
);

export const createLabelsAction = createActionType(
  labelsActionPrefix,
  'createLabel'
);

export const updateLabelAction = createActionType(
  labelsActionPrefix,
  'updateLabel'
);

export const deleteLabelAction = createActionType(
  labelsActionPrefix,
  'deleteLabel'
);
