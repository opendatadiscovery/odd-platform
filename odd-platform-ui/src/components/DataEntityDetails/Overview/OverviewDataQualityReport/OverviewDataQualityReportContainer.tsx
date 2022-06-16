import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import {
  getDatasetTestReport,
  getDatasetTestReportFetching,
} from 'redux/selectors/dataQualityTest.selectors';
import OverviewDataQualityReport from './OverviewDataQualityReport';

const mapStateToProps = (
  state: RootState,
  { dataEntityId }: { dataEntityId: number }
) => ({
  isDatasetTestReportFetching: getDatasetTestReportFetching(state),
  dataEntityId,
  datasetQualityTestReport: getDatasetTestReport(state, dataEntityId),
});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OverviewDataQualityReport);
