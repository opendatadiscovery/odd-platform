import { createActionType } from 'redux/lib/helpers';

export const labelsActionPrefix = 'labels';

export const fetchLabelsActionType = createActionType(labelsActionPrefix, 'fetchLabels');
export const createLabelsActionType = createActionType(labelsActionPrefix, 'createLabel');
export const updateLabelActionType = createActionType(labelsActionPrefix, 'updateLabel');
export const deleteLabelActionType = createActionType(labelsActionPrefix, 'deleteLabel');
