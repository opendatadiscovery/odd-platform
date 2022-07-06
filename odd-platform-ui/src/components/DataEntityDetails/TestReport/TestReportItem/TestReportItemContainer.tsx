import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import TestReportItem from 'components/DataEntityDetails/TestReport/TestReportItem/TestReportItem';

const mapStateToProps = (
  state: RootState,
  {
    dataQATestId,
  }: {
    dataQATestId: number;
  }
) => ({
  dataQATestId,
});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TestReportItem);
