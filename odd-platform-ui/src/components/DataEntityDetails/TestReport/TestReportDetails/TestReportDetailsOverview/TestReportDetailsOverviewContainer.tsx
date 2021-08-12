import { withStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import TestReportDetailsOverview from 'components/DataEntityDetails/TestReport/TestReportDetails/TestReportDetailsOverview/TestReportDetailsOverview';
import {
  getDatasetTestListFetching,
  getQualityTestByTestId,
} from 'redux/selectors/dataQualityTest.selectors';
import { styles } from 'components/DataEntityDetails/TestReport/TestReportDetails/TestReportDetailsOverview/TestReportDetailsOverviewStyles';
import { RouteComponentProps } from 'react-router-dom';

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
  qualityTest: getQualityTestByTestId(state, dataqatestId),
  isDatasetTestListFetching: getDatasetTestListFetching(state),
});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(TestReportDetailsOverview));
