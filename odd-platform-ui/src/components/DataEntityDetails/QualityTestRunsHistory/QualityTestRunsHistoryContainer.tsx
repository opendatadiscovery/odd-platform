import { withStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { RootState } from 'redux/interfaces';
import { fetchDataSetQualityTestRuns } from 'redux/thunks';
import {
  getDatasetTestRunsFetching,
  getQualityTestRunsList,
} from 'redux/selectors/dataQualityTest.selectors';
import { styles } from 'components/DataEntityDetails/QualityTestRunsHistory/QualityTestRunsHistoryStyles';
import QualityTestRunsHistory from 'components/DataEntityDetails/QualityTestRunsHistory/QualityTestRunsHistory';

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
  dataqatestId: parseInt(dataEntityId, 10),
  testRuns: getQualityTestRunsList(state, dataEntityId),
  isTestRunsFetching: getDatasetTestRunsFetching(state),
});

const mapDispatchToProps = {
  fetchDataSetQualityTestRuns,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(QualityTestRunsHistory));
