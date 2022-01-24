import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import TestReportItem from 'components/DataEntityDetails/TestReport/TestReportItem/TestReportItem';

const mapStateToProps = (
  state: RootState,
  {
    dataqatestId,
  }: {
    dataqatestId: number;
  }
) => ({
  dataqatestId,
});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TestReportItem);
