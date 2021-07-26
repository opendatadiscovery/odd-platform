import { createSelector } from 'reselect';
import { RootState, DataQualityTestState } from 'redux/interfaces';
import { createFetchingSelector } from 'redux/selectors/loader-selectors';
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
