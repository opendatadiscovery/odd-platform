import { withStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { RouteComponentProps } from 'react-router-dom';
import {
  fetchDataSetQualityTestList,
  fetchDataSetQualityTestReport,
} from 'redux/thunks';
import {
  getDatasetQualityTestsBySuiteNames,
  getDatasetTestReport,
  getTestReportBySuiteName,
} from 'redux/selectors/dataQualityTest.selectors';
import TestReport from './TestReport';
import { styles } from './TestReportStyles';

interface RouteProps {
  dataEntityId: string;
}

type OwnProps = RouteComponentProps<RouteProps>;

const mapStateToProps = (
  state: RootState,
  {
    match: {
      params: { dataEntityId },
    },
  }: OwnProps
) => ({
  dataEntityId: parseInt(dataEntityId, 10),
  datasetTestReport: getDatasetTestReport(state, dataEntityId),
  datasetQualityTestList: getDatasetQualityTestsBySuiteNames(
    state,
    dataEntityId
  ),
  testReportBySuitName: getTestReportBySuiteName(state),
});

const mapDispatchToProps = {
  fetchDataSetQualityTestReport,
  fetchDataSetQualityTestList,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(TestReport));
