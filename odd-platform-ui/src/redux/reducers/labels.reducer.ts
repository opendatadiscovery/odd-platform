import { getType } from 'typesafe-actions';
import filter from 'lodash/filter';
import * as actions from 'redux/actions';
import { Action } from 'redux/interfaces';
import { LabelsState } from 'redux/interfaces/state';

export const initialState: LabelsState = {
  byId: {},
  allIds: [],
  pageInfo: {
    total: 0,
    page: 0,
    hasNext: true,
  },
};

const reducer = (state = initialState, action: Action): LabelsState => {
  switch (action.type) {
    case getType(actions.fetchLabelsAction.success):
      return action.payload.items.reduce(
        (memo: LabelsState, label) => ({
          ...memo,
          byId: {
            ...memo.byId,
            [label.id]: {
              ...memo.byId[label.id],
              ...label,
            },
          },
          allIds: [...memo.allIds, label.id],
        }),
        {
          ...state,
          allIds:
            action.payload.pageInfo?.page > 1 ? [...state.allIds] : [],
          pageInfo: action.payload.pageInfo,
        }
      );
    case getType(actions.createLabelsAction.success):
      return action.payload.reduce(
        (memo: LabelsState, label) => ({
          ...memo,
          byId: {
            ...memo.byId,
            [label.id]: label,
          },
          allIds: [label.id, ...memo.allIds],
        }),
        state
      );
    case getType(actions.updateLabelAction.success):
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: action.payload,
        },
      };
    case getType(actions.deleteLabelAction.success):
      return {
        ...state,
        allIds: filter(
          state.allIds,
          labelId => labelId !== action.payload
        ),
      };
    default:
      return state;
  }
};

export default reducer;
