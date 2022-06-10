import {
  Action,
  DataQualityTestState,
  PaginatedResponse,
} from 'redux/interfaces';
import { getType } from 'typesafe-actions';
import * as actions from 'redux/actions';
import {
  DataEntity,
  DataEntityList,
  DataEntityRunList,
  DataEntityRunStatus,
} from 'generated-sources';
import uniq from 'lodash/uniq';

export const initialState: DataQualityTestState = {
  qualityTestsById: {},
  allSuiteNamesByDatasetId: {},
  qualityTestRunsById: {},
  allTestRunIdsByTestId: {},
  qualityTestRunsPageInfo: {
    total: 0,
    page: 0,
    hasNext: true,
  },
  datasetTestReportByEntityId: {},
  testReportBySuiteName: {},
};

const latestRunStatusesCounter = (
  arr: DataEntity[],
  suiteName: string,
  statusType: DataEntityRunStatus
): number =>
  arr.filter(
    item =>
      item.suiteName === suiteName && item.latestRun?.status === statusType
  ).length;

const createDataSetQualityTestList = (
  state: DataQualityTestState,
  payload: DataEntityList,
  datasetId: number | string
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
          ...(dataSetQualityTest.suiteName && {
            [dataSetQualityTest.suiteName]: uniq([
              dataSetQualityTest.id,
              ...(memo.allSuiteNamesByDatasetId[datasetId]?.[
                dataSetQualityTest.suiteName
              ] || []),
            ]),
          }),
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
                  DataEntityRunStatus.SUCCESS
                ),
                failed: latestRunStatusesCounter(
                  payload.items,
                  dataSetQualityTest.suiteName,
                  DataEntityRunStatus.FAILED
                ),
                broken: latestRunStatusesCounter(
                  payload.items,
                  dataSetQualityTest.suiteName,
                  DataEntityRunStatus.BROKEN
                ),
                aborted: latestRunStatusesCounter(
                  payload.items,
                  dataSetQualityTest.suiteName,
                  DataEntityRunStatus.ABORTED
                ),
                skipped: latestRunStatusesCounter(
                  payload.items,
                  dataSetQualityTest.suiteName,
                  DataEntityRunStatus.SKIPPED
                ),
                unknown: latestRunStatusesCounter(
                  payload.items,
                  dataSetQualityTest.suiteName,
                  DataEntityRunStatus.UNKNOWN
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

const createDataSetQualityRunsList = (
  state: DataQualityTestState,
  payload: PaginatedResponse<DataEntityRunList>,
  dataQATestId: number | string
) =>
  payload.items.reduce(
    (memo: DataQualityTestState, DataEntityRun) => ({
      ...memo,
      qualityTestRunsById: {
        ...memo.qualityTestRunsById,
        [DataEntityRun.id]: {
          ...memo.qualityTestRunsById[DataEntityRun.id],
          ...DataEntityRun,
        },
      },
      allTestRunIdsByTestId: {
        ...memo.allTestRunIdsByTestId,
        [dataQATestId]: uniq([
          ...(memo.allTestRunIdsByTestId?.[dataQATestId] || []),
          DataEntityRun.id,
        ]),
      },
    }),
    {
      ...state,
      allTestRunIdsByTestId:
        payload.pageInfo.page > 1
          ? { ...state.allTestRunIdsByTestId }
          : {},
      qualityTestRunsPageInfo: payload.pageInfo,
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
          [action.payload.entityId]: action.payload.value,
        },
      };
    case getType(actions.fetchDataSetQualityTestListAction.success):
      return createDataSetQualityTestList(
        state,
        action.payload.value,
        action.payload.entityId
      );
    case getType(actions.fetchDataSetQualityTestRunsAction.success):
      return createDataSetQualityRunsList(
        state,
        action.payload.value,
        action.payload.entityId
      );
    default:
      return state;
  }
};

export default reducer;
