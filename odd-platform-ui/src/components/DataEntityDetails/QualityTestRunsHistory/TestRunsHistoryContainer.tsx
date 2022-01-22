import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { RootState } from 'redux/interfaces';
import { fetchDataSetQualityTestRuns } from 'redux/thunks';
import {
  getDatasetTestRunsFetching,
  getQualityTestNameByTestId,
  getQualityTestRunsList,
} from 'redux/selectors/dataQualityTest.selectors';
import TestRunsHistory from 'components/DataEntityDetails/QualityTestRunsHistory/TestRunsHistory';

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
  dataQATestId: parseInt(dataEntityId, 10),
  dataQATestName: getQualityTestNameByTestId(state, dataEntityId),
  dataQATestRunsList: getQualityTestRunsList(state, dataEntityId),
  isTestRunsListFetching: getDatasetTestRunsFetching(state),
});

const mapDispatchToProps = {
  fetchDataSetQualityTestRuns,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TestRunsHistory);
