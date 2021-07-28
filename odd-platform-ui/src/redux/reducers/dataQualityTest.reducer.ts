import { Action, DataQualityTestState } from 'redux/interfaces';
import { getType } from 'typesafe-actions';
import * as actions from 'redux/actions';
import {
  DataEntity,
  DataEntityList,
  DataQualityTestRunStatusEnum,
} from 'generated-sources';

export const initialState: DataQualityTestState = {
  qualityTestsById: {},
  allSuiteNamesByDatasetId: {},
  qualityTestRunsById: {},
  allTestRunIdsByTestId: {},
  datasetTestReportByEntityId: {},
  testReportBySuiteName: {},
};

const latestRunStatusesCounter = (
  arr: DataEntity[],
  suiteName: string,
  statusType: DataQualityTestRunStatusEnum
): number =>
  arr.filter(
    item =>
      item.suiteName === suiteName && item.latestRun?.status === statusType
  ).length;

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
      allSuiteNamesByDatasetId: {
        ...memo.allSuiteNamesByDatasetId,
        [datasetId]: {
          ...memo.allSuiteNamesByDatasetId[datasetId],
          ...(dataSetQualityTest.suiteName
            ? {
                [dataSetQualityTest.suiteName]: [
                  dataSetQualityTest.id,
                  ...(memo.allSuiteNamesByDatasetId[datasetId]?.[
                    dataSetQualityTest.suiteName
                  ] || []),
                ],
              }
            : null),
        },
      },
      testReportBySuiteName: {
        ...memo.testReportBySuiteName,
        ...(dataSetQualityTest.suiteName
          ? {
              [dataSetQualityTest.suiteName]: {
                ...memo.testReportBySuiteName[
                  dataSetQualityTest.suiteName
                ],
                success: latestRunStatusesCounter(
                  payload.items,
                  dataSetQualityTest.suiteName,
                  DataQualityTestRunStatusEnum.SUCCESS
                ),
                failed: latestRunStatusesCounter(
                  payload.items,
                  dataSetQualityTest.suiteName,
                  DataQualityTestRunStatusEnum.FAILED
                ),
                skipped: latestRunStatusesCounter(
                  payload.items,
                  dataSetQualityTest.suiteName,
                  DataQualityTestRunStatusEnum.SKIPPED
                ),
                aborted: latestRunStatusesCounter(
                  payload.items,
                  dataSetQualityTest.suiteName,
                  DataQualityTestRunStatusEnum.ABORTED
                ),
                unknown: latestRunStatusesCounter(
                  payload.items,
                  dataSetQualityTest.suiteName,
                  DataQualityTestRunStatusEnum.UNKNOWN
                ),
              },
            }
          : null),
      },
    }),
    {
      ...state,
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
