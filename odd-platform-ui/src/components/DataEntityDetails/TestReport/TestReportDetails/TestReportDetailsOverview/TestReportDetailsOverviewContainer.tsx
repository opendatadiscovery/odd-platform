import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import TestReportDetailsOverview from 'components/DataEntityDetails/TestReport/TestReportDetails/TestReportDetailsOverview/TestReportDetailsOverview';
import {
  getDatasetTestListFetching,
  getQualityTestByTestId,
} from 'redux/selectors/dataQualityTest.selectors';
import { RouteComponentProps } from 'react-router-dom';

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
  qualityTest: getQualityTestByTestId(state, dataQATestId),
  isDatasetTestListFetching: getDatasetTestListFetching(state),
});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TestReportDetailsOverview);
