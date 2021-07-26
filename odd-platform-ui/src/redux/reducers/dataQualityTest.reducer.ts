import { Action, DataQualityTestState } from 'redux/interfaces';
import { getType } from 'typesafe-actions';
import * as actions from 'redux/actions';

export const initialState: DataQualityTestState = {
  qualityTestsById: {},
  allTestIdsByDatasetId: {},
  qualityTestRunsById: {},
  allTestRunIdsByTestId: {},
  datasetTestReportByEntityId: {},
};

const reducer = (
  state = initialState,
  action: Action
): DataQualityTestState => {
  switch (action.type) {
    case getType(actions.fetchDataSetQualityTestReportAction.success):
      return {
        ...state,
        datasetTestReportByEntityId: {
          [action.payload.dataEntityId]: action.payload.value,
        },
      };

    default:
      return state;
  }
};

export default reducer;
