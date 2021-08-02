import { createSelector } from 'reselect';
import { RootState, DataQualityTestState } from 'redux/interfaces';
import { createFetchingSelector } from 'redux/selectors/loader-selectors';
import { isEmpty } from 'lodash';
import { getDataEntityId } from './dataentity.selectors';

const getDataQualityTestState = ({
  dataQualityTest,
}: RootState): DataQualityTestState => dataQualityTest;

const getDatasetTestReportFetchingStatus = createFetchingSelector(
  'GET_DATA_SET_QUALITY_TEST_REPORT'
);

export const getDatasetTestReportFetching = createSelector(
  getDatasetTestReportFetchingStatus,
  status => status === 'fetching'
);

export const getDatasetTestReport = createSelector(
  getDataQualityTestState,
  getDataEntityId,
  (dataQualityTestState, dataEntityId) =>
    dataQualityTestState.datasetTestReportByEntityId[dataEntityId]
);

export const getDatasetQualityTestList = createSelector(
  getDataQualityTestState,
  dataQualityTestState => dataQualityTestState.qualityTestsById
);

export const getSuitNamesByDatasetId = createSelector(
  getDataQualityTestState,
  getDataEntityId,
  (dataQualityTestState, dataEntityId) =>
    dataQualityTestState.allSuiteNamesByDatasetId[dataEntityId]
);

export const getDatasetQualityTestsBySuiteNames = createSelector(
  getDataQualityTestState,
  getDataEntityId,
  (dataQualityTestState, dataEntityId) => {
    if (
      isEmpty(dataQualityTestState.allSuiteNamesByDatasetId[dataEntityId])
    ) {
      return {};
    }
    const suitNamesByDatasetId = Object.entries(
      dataQualityTestState.allSuiteNamesByDatasetId[dataEntityId]
    ).map(([key, values]) => {
      const newValues = values.map(
        id => dataQualityTestState.qualityTestsById[id]
      );
      return [key, newValues];
    });
    return Object.fromEntries(suitNamesByDatasetId);
  }
);

export const getTestReportListBySuiteName = createSelector(
  getDataQualityTestState,
  dataQualityTestState => dataQualityTestState.testReportBySuiteName
);

export const getTestReportSuiteNames = createSelector(
  getDataQualityTestState,
  getDataEntityId,
  (dataQualityTestState, dataEntityId) => {
    if (isEmpty(dataQualityTestState.allSuiteNamesByDatasetId)) {
      return [];
    }
    return Object.keys(
      dataQualityTestState.allSuiteNamesByDatasetId?.[dataEntityId]
    );
  }
);

export const getDataQATestId = (
  _: RootState,
  dataQATestId: number | string
) => dataQATestId;

export const getQualityTestRunsList = createSelector(
  getDataQualityTestState,
  getDataQATestId,
  (dataQualityTestState, dataQATestId) =>
    dataQualityTestState.allTestRunIdsByTestId[dataQATestId]?.map(
      testRunId => dataQualityTestState.qualityTestRunsById[testRunId]
    )
);

export const getQualityTestByTestId = createSelector(
  getDataQualityTestState,
  getDataQATestId,
  (dataQualityTestState, dataQATestId) =>
    dataQualityTestState.qualityTestsById[dataQATestId]
);
