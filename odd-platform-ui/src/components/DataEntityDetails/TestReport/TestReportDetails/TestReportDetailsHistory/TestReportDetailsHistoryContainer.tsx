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
  dataQATestId: string;
}

type OwnProps = RouteComponentProps<RouteProps>;

const mapStateToProps = (
  state: RootState,
  {
    match: {
      params: { dataQATestId },
    },
  }: OwnProps
) => ({
  dataQATestId: parseInt(dataQATestId, 10),
  dataQATestRunsList: getQualityTestRunsList(state, dataQATestId),
  dataQATestName: getQualityTestNameByTestId(state, dataQATestId),
  testRunsFetching: getDatasetTestRunsFetching(state),
});

const mapDispatchToProps = { fetchDataSetQualityTestRuns };

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TestReportDetailsHistory);
