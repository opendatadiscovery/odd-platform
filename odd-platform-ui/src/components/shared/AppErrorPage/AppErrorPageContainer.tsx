import { withStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import { RootState } from 'redux/interfaces';
import AppErrorPage from './AppErrorPage';
import { styles } from './AppErrorPageStyles';

const mapStateToProps = (state: RootState) => ({
  errorType: '',
});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(AppErrorPage));
