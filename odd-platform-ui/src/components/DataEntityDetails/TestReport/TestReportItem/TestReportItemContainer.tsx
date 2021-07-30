import { withStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import TestReportItem from 'components/DataEntityDetails/TestReport/TestReportItem/TestReportItem';
import { styles } from './TestReportItemStyles';

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
)(withStyles(styles)(TestReportItem));
