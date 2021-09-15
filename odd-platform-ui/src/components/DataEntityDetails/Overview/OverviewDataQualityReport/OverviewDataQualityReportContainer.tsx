import { withStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getDatasetTestReport,
  getDatasetTestReportFetching,
} from 'redux/selectors/dataQualityTest.selectors';
import { fetchDataSetQualityTestReport } from 'redux/thunks/dataQualityTest.thunks';
import OverviewDataQualityReport from './OverviewDataQualityReport';
import { styles } from './OverviewDataQualityReportStyles';

const mapStateToProps = (
  state: RootState,
  { dataEntityId }: { dataEntityId: number }
) => ({
  isDatasetTestReportFetching: getDatasetTestReportFetching(state),
  dataEntityId,
  datasetQualityTestReport: getDatasetTestReport(state, dataEntityId),
});

const mapDispatchToProps = {
  fetchDataSetQualityTestReport,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(OverviewDataQualityReport));
