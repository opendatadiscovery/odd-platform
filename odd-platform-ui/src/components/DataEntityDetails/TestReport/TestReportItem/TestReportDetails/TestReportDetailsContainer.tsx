import { withStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import TestReportDetails from 'components/DataEntityDetails/TestReport/TestReportItem/TestReportDetails/TestReportDetails';
import { getQualityTestRunsList } from 'redux/selectors/dataQualityTest.selectors';
import { fetchDataSetQualityTestRuns } from 'redux/thunks';
import { styles } from 'components/DataEntityDetails/TestReport/TestReportItem/TestReportDetails/TestReportDetailsStyles';

const mapStateToProps = (
  state: RootState,
  {
    dataqatestId,
  }: {
    dataqatestId: number;
  }
) => ({
  dataqatestId,
  testRunsList: getQualityTestRunsList(state, dataqatestId),
});

const mapDispatchToProps = { fetchDataSetQualityTestRuns };

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(TestReportDetails));
