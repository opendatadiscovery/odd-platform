import type { DataQualityTestState } from 'redux/interfaces';
import { createSlice } from '@reduxjs/toolkit';
import * as thunks from 'redux/thunks';
import { dataQualityTestTypePrefix } from 'redux/actions';
import {
  type DataEntity,
  type DataEntityList,
  DataEntityRunStatus,
} from 'generated-sources';
import uniq from 'lodash/uniq';

export const initialState: DataQualityTestState = {
  qualityTestsById: {},
  allSuiteNamesByDatasetId: {},
  qualityTestRunsPageInfo: { total: 0, page: 0, hasNext: true },
  datasetTestReportByEntityId: {},
  datasetSLAReportByEntityId: {},
  testReportBySuiteName: {},
};

const latestRunStatusesCounter = (
  arr: DataEntity[],
  suiteName: string,
  statusType: DataEntityRunStatus
): number =>
  arr.filter(
    item => item.suiteName === suiteName && item.latestRun?.status === statusType
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
                ...memo.testReportBySuiteName[dataSetQualityTest.suiteName],
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
    { ...state }
  );

export const dataQualityTestSlice = createSlice({
  name: dataQualityTestTypePrefix,
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(
      thunks.fetchDataSetQualityTestReport.fulfilled,
      (state, { payload }) => ({
        ...state,
        datasetTestReportByEntityId: {
          ...state.datasetTestReportByEntityId,
          [payload.entityId]: payload.value,
        },
      })
    );

    builder.addCase(
      thunks.fetchDataSetQualitySLAReport.fulfilled,
      (state, { payload }): DataQualityTestState => ({
        ...state,
        datasetSLAReportByEntityId: {
          ...state.datasetSLAReportByEntityId,
          [payload.entityId]: payload.value,
        },
      })
    );

    builder.addCase(thunks.fetchDataSetQualityTestList.fulfilled, (state, { payload }) =>
      createDataSetQualityTestList(state, payload.value, payload.entityId)
    );
  },
});
export default dataQualityTestSlice.reducer;
