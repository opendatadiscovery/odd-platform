import { Action, DataQualityTestState } from 'redux/interfaces';
import { getType } from 'typesafe-actions';
import * as actions from 'redux/actions';
import { DataEntityList } from 'generated-sources';

export const initialState: DataQualityTestState = {
  qualityTestsById: {},
  allTestIdsByDatasetId: {},
  qualityTestRunsById: {},
  allTestRunIdsByTestId: {},
  datasetTestReportByEntityId: {},
};

const createDataSetQualityTestList = (
  state: DataQualityTestState,
  payload: DataEntityList,
  datasetId: number
) =>
  payload.items.reduce(
    (memo: DataQualityTestState, dataSetQualityTest) => ({
      ...memo,
      qualityTestsById: {
        ...memo.qualityTestsById,
        [dataSetQualityTest.id]: {
          ...memo.qualityTestsById[dataSetQualityTest.id],
          ...dataSetQualityTest,
        },
      },
      allTestIdsByDatasetId: {
        ...memo.allTestIdsByDatasetId,
        [datasetId]: [
          ...memo.allTestIdsByDatasetId[datasetId],
          dataSetQualityTest.id,
        ],
      },
    }),
    {
      ...state,
      qualityTestsById: {},
      allTestIdsByDatasetId: {},
    }
  );

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
    case getType(actions.fetchDataSetQualityTestListAction.success):
      return createDataSetQualityTestList(
        state,
        action.payload.value,
        action.payload.dataEntityId
      );
    default:
      return state;
  }
};

export default reducer;
