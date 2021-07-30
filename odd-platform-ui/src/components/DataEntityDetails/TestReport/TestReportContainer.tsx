import { withStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { RouteComponentProps } from 'react-router-dom';
import {
  fetchDataSetQualityTestList,
  fetchDataSetQualityTestReport,
  fetchDataSetQualityTestRuns,
} from 'redux/thunks';
import {
  getDatasetQualityTestsBySuiteNames,
  getDatasetTestReport,
  getTestReportListBySuiteName,
} from 'redux/selectors/dataQualityTest.selectors';
import TestReport from './TestReport';
import { styles } from './TestReportStyles';

interface RouteProps {
  dataEntityId: string;
  dataqatestId: string;
  reportDetailsViewType: string;
}

type OwnProps = RouteComponentProps<RouteProps>;

const mapStateToProps = (
  state: RootState,
  {
    match: {
      params: { dataEntityId, dataqatestId, reportDetailsViewType },
    },
  }: OwnProps
) => ({
  reportDetailsViewType,
  dataEntityId: parseInt(dataEntityId, 10),
  dataqatestId: parseInt(dataqatestId, 10),
  datasetTestReport: getDatasetTestReport(state, dataEntityId),
  datasetQualityTestList: getDatasetQualityTestsBySuiteNames(
    state,
    dataEntityId
  ),
  testReportBySuitName: getTestReportListBySuiteName(state),
});

const mapDispatchToProps = {
  fetchDataSetQualityTestReport,
  fetchDataSetQualityTestList,
  fetchDataSetQualityTestRuns,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(TestReport));
