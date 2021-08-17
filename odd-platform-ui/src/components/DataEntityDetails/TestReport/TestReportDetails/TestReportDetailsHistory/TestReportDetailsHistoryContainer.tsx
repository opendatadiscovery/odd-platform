import { withStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import TestReportDetailsHistory from 'components/DataEntityDetails/TestReport/TestReportDetails/TestReportDetailsHistory/TestReportDetailsHistory';
import { styles } from 'components/DataEntityDetails/TestReport/TestReportDetails/TestReportDetailsHistory/TestReportDetailsHistoryStyles';
import { RouteComponentProps } from 'react-router-dom';
import { fetchDataSetQualityTestRuns } from 'redux/thunks';
import {
  getQualityTestRunsList,
  getDatasetTestRunsFetching,
} from 'redux/selectors/dataQualityTest.selectors';

interface RouteProps {
  dataqatestId: string;
}

type OwnProps = RouteComponentProps<RouteProps>;

const mapStateToProps = (
  state: RootState,
  {
    match: {
      params: { dataqatestId },
    },
  }: OwnProps
) => ({
  dataqatestId: parseInt(dataqatestId, 10),
  testRunsList: getQualityTestRunsList(state, dataqatestId),
  testRunsFetching: getDatasetTestRunsFetching(state),
});

const mapDispatchToProps = { fetchDataSetQualityTestRuns };

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(TestReportDetailsHistory));
