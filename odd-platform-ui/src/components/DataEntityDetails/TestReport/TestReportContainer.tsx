import { withStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import TestReport from './TestReport';
import { styles } from './TestReportStyles';

const mapStateToProps = (state: RootState) => ({});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(TestReport));
