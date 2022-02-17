import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import TestReportDetailsHistory from 'components/DataEntityDetails/TestReport/TestReportDetails/TestReportDetailsHistory/TestReportDetailsHistory';
import { RouteComponentProps } from 'react-router-dom';
import { fetchDataSetQualityTestRuns } from 'redux/thunks';
import {
  getDatasetTestRunsFetching,
  getQualityTestNameByTestId,
  getQualityTestRunsList,
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
  dataQATestId: parseInt(dataqatestId, 10),
  dataQATestRunsList: getQualityTestRunsList(state, dataqatestId),
  dataQATestName: getQualityTestNameByTestId(state, dataqatestId),
  testRunsFetching: getDatasetTestRunsFetching(state),
});

const mapDispatchToProps = { fetchDataSetQualityTestRuns };

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TestReportDetailsHistory);
