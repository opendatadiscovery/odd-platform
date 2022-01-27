import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import TestReportDetails from 'components/DataEntityDetails/TestReport/TestReportDetails/TestReportDetails';
import { getQualityTestByTestId } from 'redux/selectors/dataQualityTest.selectors';
import { fetchDataSetQualityTestRuns } from 'redux/thunks';

const mapStateToProps = (
  state: RootState,
  {
    dataqatestId,
    dataEntityId,
    reportDetailsViewType,
  }: {
    dataqatestId: number;
    dataEntityId: number;
    reportDetailsViewType: string;
  }
) => ({
  dataQATestId: dataqatestId,
  dataEntityId,
  reportDetailsViewType,
  qualityTest: getQualityTestByTestId(state, dataqatestId),
});

const mapDispatchToProps = { fetchDataSetQualityTestRuns };

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TestReportDetails);
